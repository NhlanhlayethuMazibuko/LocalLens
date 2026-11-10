import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { fetchPlaces, fetchWeather } from './api.js';
import { loadDetails, searchNearby, searchRadiusKm, todaysHours } from './google.js';
import { distanceKm } from './places.js';

const MIN_ZOOM = 13;
const GOOGLE_MIN_ZOOM = 11;

export function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function useOsmPlaces(type, view) {
  const [state, setState] = useState({ places: [], status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const debouncedView = useDebouncedValue(view, 700);

  useEffect(() => {
    if (!debouncedView) return;
    if (debouncedView.zoom < MIN_ZOOM) {
      setState({ places: [], status: 'zoom' });
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({ places: previous.places, status: 'loading' }));

    fetchPlaces(type, debouncedView.bounds, controller.signal)
      .then((places) => setState({ places, status: 'ready' }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ places: [], status: error.message === 'busy' ? 'busy' : 'error' });
      });

    return () => controller.abort();
  }, [type, debouncedView, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const visiblePlaces = useMemo(() => {
    if (!view) return state.places;
    const { south, north, west, east } = view.bounds;
    return state.places.filter((p) => p.lat >= south && p.lat <= north && p.lng >= west && p.lng <= east);
  }, [state.places, view]);

  return { places: visiblePlaces, status: state.status, retry, canSearchArea: false, searchArea: retry };
}

export function useGooglePlaces(type, view) {
  const placesLibrary = useMapsLibrary('places');
  const settledView = useDebouncedValue(view, 700);
  const [request, setRequest] = useState(null);
  const [state, setState] = useState({ places: [], status: 'idle' });

  useEffect(() => {
    if (!settledView) return;
    setRequest((previous) => {
      if (!previous || previous.type !== type) return { type, view: settledView, attempt: 0 };
      const zoomedInEnough = previous.view.zoom < GOOGLE_MIN_ZOOM && settledView.zoom >= GOOGLE_MIN_ZOOM;
      if (zoomedInEnough) return { type, view: settledView, attempt: 0 };
      const movedKm = distanceKm(previous.view.center, settledView.center);
      return movedKm > searchRadiusKm(previous.view) ? { type, view: settledView, attempt: 0 } : previous;
    });
  }, [type, settledView]);

  useEffect(() => {
    if (!placesLibrary || !request) return;
    if (request.view.zoom < GOOGLE_MIN_ZOOM) {
      setState({ places: [], status: 'zoom' });
      return;
    }
    let cancelled = false;
    setState((previous) => ({ places: previous.places, status: 'loading' }));
    searchNearby(placesLibrary, request.type, request.view)
      .then((places) => !cancelled && setState({ places, status: 'ready' }))
      .catch((error) => {
        console.error('Google Places search failed:', error);
        if (!cancelled) setState({ places: [], status: 'setup' });
      });
    return () => {
      cancelled = true;
    };
  }, [placesLibrary, request]);

  const searchArea = useCallback(() => {
    if (view) setRequest((previous) => ({ type, view, attempt: (previous?.attempt ?? 0) + 1 }));
  }, [type, view]);

  const canSearchArea =
    Boolean(request && view) &&
    state.status !== 'loading' &&
    (distanceKm(request.view.center, view.center) > searchRadiusKm(request.view) * 0.3 ||
      Math.abs(view.zoom - request.view.zoom) >= 2);

  return { places: state.places, status: state.status, retry: searchArea, canSearchArea, searchArea };
}

export function useGoogleDetails(place) {
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    loadDetails(place)
      .then((details) => !cancelled && setExtra({ id: place.id, ...details }))
      .catch((error) => {
        console.error('Google place details failed:', error);
        if (!cancelled) setExtra({ id: place.id, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [place]);

  if (!place) return null;
  if (extra?.id === place.id) return { ...place, ...extra, detailsLoaded: true };
  return { ...place, detailsLoaded: false };
}

export function useOsmDetails(place) {
  return place && { ...place, detailsLoaded: true };
}

export function useWeather(center) {
  const [weather, setWeather] = useState(null);
  const key = center ? `${center.lat.toFixed(1)},${center.lng.toFixed(1)}` : null;

  useEffect(() => {
    if (!key) return;
    const [lat, lng] = key.split(',').map(Number);
    const controller = new AbortController();
    fetchWeather({ lat, lng }, controller.signal)
      .then(setWeather)
      .catch(() => {});
    return () => controller.abort();
  }, [key]);

  return weather;
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function useTheme() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggleTheme];
}

export function useSavedPlaces() {
  // Newest first. Each entry is a copy of the place, so the Saved list works
  // even after you've moved the map somewhere else.
  const [saved, setSaved] = useState(() => readStorage(SAVED_KEY, []));

  const toggleSaved = useCallback((place) => {
    setSaved((previous) => {
      const next = previous.some((p) => p.id === place.id)
        ? previous.filter((p) => p.id !== place.id)
        : [toSnapshot(place), ...previous];
      writeStorage(SAVED_KEY, next);
      return next;
    });
  }, []);

  const savedPlaces = useMemo(() => saved.map(withTodaysHours), [saved]);
  const isSaved = useCallback((id) => saved.some((p) => p.id === id), [saved]);

  return { savedPlaces, isSaved, toggleSaved };
}

const SAVED_KEY = 'saved-places-v2';

// Keep only plain data that can be stored as JSON.
function toSnapshot(place) {
  const { googlePlace, distance, detailsLoaded, failed, reviews, ...rest } = place;
  return rest;
}

// "Today: ..." changes every day, so work it out again from the weekly hours.
function withTodaysHours(place) {
  if (!place.openingHours || !place.allHours) return place;
  return { ...place, hours: todaysHours(place.allHours.split('\n')) };
}
