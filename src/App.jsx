import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Filters, { SortSelect } from './components/Filters.jsx';
import PlaceList, { EmptyState } from './components/PlaceList.jsx';
import PlaceDetails from './components/PlaceDetails.jsx';
import MapView from './components/MapView.jsx';
import GoogleMapView from './components/GoogleMapView.jsx';
import WeatherBadge from './components/WeatherBadge.jsx';
import { CheckIcon, HeartIcon, SearchIcon } from './components/Icons.jsx';
import {
  useGoogleDetails,
  useGooglePlaces,
  useOsmDetails,
  useOsmPlaces,
  useSavedPlaces,
  useTheme,
  useVisitedPlaces,
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
  hotels: 'Somewhere to crash tonight.',
  attractions: 'Worth leaving the house for.',
};

const MY_LISTS = {
  saved: {
    title: 'Your little black book.',
    recentLabel: 'Recently saved',
    emptyIcon: <HeartIcon size={24} />,
    emptyTitle: 'Nothing saved yet',
    emptyText: "Tap the heart on any place and it'll wait for you here.",
  },
  visited: {
    title: 'Been there, done that.',
    recentLabel: 'Most recent',
    emptyIcon: <CheckIcon size={24} />,
    emptyTitle: 'Nowhere ticked off yet',
    emptyText: "Open a place and tick I've been here once you have gone.",
  },
};

const SORTERS = {
  distance: (a, b) => a.distance - b.distance,
  name: (a, b) => a.name.localeCompare(b.name),
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || reviewCount(b) - reviewCount(a),
  reviews: (a, b) => reviewCount(b) - reviewCount(a) || (b.rating ?? 0) - (a.rating ?? 0),
  recent: () => 0, // saved and visited lists are already stored newest first
};

function reviewCount(place) {
  return place.reviewCount ?? 0;
}

// The three numbers at the top of Been there.
function visitStats(places) {
  const now = new Date();
  const thisMonth = places.filter((place) => {
    const visited = new Date(place.visitedAt);
    return visited.getMonth() === now.getMonth() && visited.getFullYear() === now.getFullYear();
  });
  const rated = places.filter((place) => place.rating != null);
  const average = rated.reduce((sum, place) => sum + place.rating, 0) / rated.length;
  return [
    [places.length, places.length === 1 ? 'Place' : 'Places'],
    [thisMonth.length, 'This month'],
    [rated.length ? average.toFixed(1) : '–', 'Average rating'],
  ];
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [type, setType] = useState('restaurants');
  const [sort, setSort] = useState(USE_GOOGLE ? 'rating' : 'distance');
  const [listSort, setListSort] = useState('recent'); // for Saved and Been there
  const [tab, setTab] = useState('explore'); // explore | saved | visited
  const [openNow, setOpenNow] = useState(false);
  const [view, setView] = useState(null);
  const [origin, setOrigin] = useState(DEFAULT_CENTER);
  const [flyTarget, setFlyTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const { places, status, retry, canSearchArea, searchArea } = usePlaces(type, view);
  const selectedDetails = usePlaceDetails(selected);
  const weather = useWeather(view?.center);
  const { savedPlaces, isSaved, toggleSaved, removeSaved } = useSavedPlaces();
  const { visitedPlaces, isVisited, addVisited, removeVisited } = useVisitedPlaces();
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

  const myList = useMemo(() => {
    const list = MY_LISTS[tab];
    if (!list) return null;
    const source = tab === 'saved' ? savedPlaces : visitedPlaces;
    const places = source.map((place) => ({ ...place, distance: distanceKm(origin, place) }));
    return { ...list, places: places.sort(SORTERS[listSort]) };
  }, [tab, savedPlaces, visitedPlaces, origin, listSort]);

  const shownPlaces = myList ? myList.places : sortedPlaces;
  const selectedVisit = selected && visitedPlaces.find((p) => p.id === selected.id);

  // Ticking "Been here" moves a place from Saved to Visited.
  function toggleVisited() {
    if (isVisited(selected.id)) {
      removeVisited(selected.id);
    } else {
      addVisited(selected);
      removeSaved(selected.id);
    }
  }

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
    <div className={`app${selected ? ' app--details' : ''}`}>
      <Header theme={theme} onToggleTheme={toggleTheme} onPickLocation={pickLocation} />

      <section ref={panelRef} className="panel">
        {selectedDetails ? (
          <PlaceDetails
            place={{ ...selectedDetails, distance: distanceKm(origin, selectedDetails) }}
            saved={isSaved(selected.id)}
            visitedAt={selectedVisit?.visitedAt}
            onToggleSave={() => toggleSaved(selected)}
            onToggleVisited={toggleVisited}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <Tabs
              tab={tab}
              counts={{ saved: savedPlaces.length, visited: visitedPlaces.length }}
              onChange={setTab}
            />
            {myList ? (
              <>
                <h1 className="panel__title">{myList.title}</h1>
                {tab === 'visited' && myList.places.length > 0 && (
                  <dl className="stats">
                    {visitStats(myList.places).map(([value, label]) => (
                      <div key={label} className="stats__item">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <PlaceList
                  places={myList.places}
                  status="ready"
                  sort={null}
                  empty={
                    <EmptyState
                      icon={myList.emptyIcon}
                      title={myList.emptyTitle}
                      text={myList.emptyText}
                      action={
                        <button type="button" className="btn btn--primary" onClick={() => setTab('explore')}>
                          Explore places
                        </button>
                      }
                    />
                  }
                  sortControl={
                    <SortSelect
                      value={listSort}
                      hasRatings={USE_GOOGLE}
                      recentLabel={myList.recentLabel}
                      onChange={setListSort}
                    />
                  }
                  onSelect={selectPlace}
                />
              </>
            ) : (
              <>
                <h1 className="panel__title">{TITLES[type]}</h1>
                <Filters
                  type={type}
                  hasHours={USE_GOOGLE}
                  openNow={openNow}
                  onTypeChange={setType}
                  onOpenNowChange={setOpenNow}
                />
                <PlaceList
                  places={sortedPlaces}
                  status={status}
                  sort={sort}
                  openNow={openNow}
                  sortControl={<SortSelect value={sort} hasRatings={USE_GOOGLE} onChange={setSort} />}
                  isSaved={isSaved}
                  onToggleSave={toggleSaved}
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
          visited={tab === 'visited'}
        />
        {canSearchArea && !selected && !myList && (
          <button type="button" className="search-area" onClick={searchArea}>
            <SearchIcon size={16} /> Search this area
          </button>
        )}
        <WeatherBadge weather={weather} />
      </div>
    </div>
  );
}

const TABS = [
  ['explore', 'Explore'],
  ['saved', 'Saved'],
  ['visited', 'Been there'],
];

function Tabs({ tab, counts, onChange }) {
  return (
    <div className="tabs" role="tablist" aria-label="What to show">
      {TABS.map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          className="tabs__tab"
          aria-selected={tab === value}
          onClick={() => onChange(value)}
        >
          {label}
          {counts[value] > 0 && <span className="tabs__count">{counts[value]}</span>}
        </button>
      ))}
    </div>
  );
}
