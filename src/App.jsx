import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Filters from './components/Filters.jsx';
import PlaceList from './components/PlaceList.jsx';
import PlaceDetails from './components/PlaceDetails.jsx';
import MapView from './components/MapView.jsx';
import GoogleMapView from './components/GoogleMapView.jsx';
import WeatherBadge from './components/WeatherBadge.jsx';
import { SearchIcon } from './components/Icons.jsx';
import {
  useGoogleDetails,
  useGooglePlaces,
  useOsmDetails,
  useOsmPlaces,
  useSavedPlaces,
  useTheme,
  useWeather,
} from './lib/hooks.js';
import { USE_GOOGLE } from './lib/config.js';
import { distanceKm, isOpenNow } from './lib/places.js';
import './App.css';

const usePlaces = USE_GOOGLE ? useGooglePlaces : useOsmPlaces;
const usePlaceDetails = USE_GOOGLE ? useGoogleDetails : useOsmDetails;
const PlacesMap = USE_GOOGLE ? GoogleMapView : MapView;

const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 };

const TITLES = {
  restaurants: "Hungry? Here's the good stuff.",
  hotels: 'Somewhere to crash tonight',
  attractions: 'Worth leaving the house for',
};

const SORTERS = {
  distance: (a, b) => a.distance - b.distance,
  name: (a, b) => a.name.localeCompare(b.name),
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || b.reviewCount - a.reviewCount,
};

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [type, setType] = useState('restaurants');
  const [sort, setSort] = useState(USE_GOOGLE ? 'rating' : 'distance');
  const [tab, setTab] = useState('explore'); // explore | saved
  const [openNow, setOpenNow] = useState(false);
  const [view, setView] = useState(null);
  const [origin, setOrigin] = useState(DEFAULT_CENTER);
  const [flyTarget, setFlyTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const { places, status, retry, canSearchArea, searchArea } = usePlaces(type, view);
  const selectedDetails = usePlaceDetails(selected);
  const weather = useWeather(view?.center);
  const { savedPlaces, isSaved, toggleSaved } = useSavedPlaces();
  const panelRef = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const here = { lat: position.coords.latitude, lng: position.coords.longitude };
        setOrigin(here);
        setFlyTarget({ ...here, zoom: 15 });
      },
      () => {},
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [selected]);

  const sortedPlaces = useMemo(() => {
    const shown = openNow ? places.filter((place) => isOpenNow(place) === true) : places;
    const withDistance = shown.map((place) => ({ ...place, distance: distanceKm(origin, place) }));
    return withDistance.sort(SORTERS[sort]);
  }, [places, origin, sort, openNow]);

  const savedWithDistance = useMemo(
    () => savedPlaces.map((place) => ({ ...place, distance: distanceKm(origin, place) })),
    [savedPlaces, origin],
  );

  const isSavedTab = tab === 'saved';
  const shownPlaces = isSavedTab ? savedWithDistance : sortedPlaces;

  function selectPlace(place) {
    setSelected(place);
    setFlyTarget({ lat: place.lat, lng: place.lng, zoom: Math.max(view?.zoom ?? 16, 16) });
  }

  function pickLocation(location) {
    setSelected(null);
    setOrigin({ lat: location.lat, lng: location.lng });
    setFlyTarget({ lat: location.lat, lng: location.lng, zoom: 15 });
  }

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} onPickLocation={pickLocation} />

      <main className="app-body">
        <section ref={panelRef} className={`panel${selected ? ' panel--details' : ''}`}>
          {selectedDetails ? (
            <PlaceDetails
              place={{ ...selectedDetails, distance: distanceKm(origin, selectedDetails) }}
              saved={isSaved(selected.id)}
              onToggleSave={() => toggleSaved(selected)}
              onBack={() => setSelected(null)}
            />
          ) : (
            <>
              <Tabs tab={tab} savedCount={savedPlaces.length} onChange={setTab} />
              {isSavedTab ? (
                <>
                  <h1 className="panel__title">Your little black book</h1>
                  <PlaceList
                    places={savedWithDistance}
                    status="ready"
                    sort={null}
                    emptyText="Nothing saved yet. Tap the heart on any place and it'll wait for you here."
                    onSelect={selectPlace}
                  />
                </>
              ) : (
                <>
                  <h1 className="panel__title">{TITLES[type]}</h1>
                  <Filters
                    type={type}
                    sort={sort}
                    hasRatings={USE_GOOGLE}
                    openNow={openNow}
                    onTypeChange={setType}
                    onSortChange={setSort}
                    onOpenNowChange={setOpenNow}
                  />
                  <PlaceList
                    places={sortedPlaces}
                    status={status}
                    sort={sort}
                    openNow={openNow}
                    onRetry={retry}
                    onSelect={selectPlace}
                  />
                </>
              )}
            </>
          )}
        </section>

        <div className="map-wrap">
          <PlacesMap
            initialCenter={DEFAULT_CENTER}
            places={shownPlaces}
            selected={selected}
            onSelect={selectPlace}
            onViewChange={setView}
            flyTarget={flyTarget}
            theme={theme}
          />
          {canSearchArea && !selected && !isSavedTab && (
            <button type="button" className="search-area" onClick={searchArea}>
              <SearchIcon size={16} /> Look around here
            </button>
          )}
          <WeatherBadge weather={weather} />
        </div>
      </main>
    </div>
  );
}

function Tabs({ tab, savedCount, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="What to show">
      <button
        type="button"
        role="tab"
        className="tabs__tab"
        aria-selected={tab === 'explore'}
        onClick={() => onChange('explore')}
      >
        Explore
      </button>
      <button
        type="button"
        role="tab"
        className="tabs__tab"
        aria-selected={tab === 'saved'}
        onClick={() => onChange('saved')}
      >
        Saved
        {savedCount > 0 && <span className="tabs__count">{savedCount}</span>}
      </button>
    </div>
  );
}
