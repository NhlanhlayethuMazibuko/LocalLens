import PlaceCard, { PlaceCardSkeleton } from './PlaceCard.jsx';

const MESSAGES = {
  zoom: "Zoom in a bit. We can't read the street signs from up here.",
  busy: 'The map servers are having a moment. Give them a few seconds.',
  error: "Can't reach the internet right now. Check your connection.",
  setup:
    "Google couldn't load places. Check that your API key and the Places API are set up (see the README).",
};

// The first card gets a big spot, depending on how the list is sorted.
const BADGES = {
  rating: 'Crowd favourite',
  distance: 'Closest to you',
};

export default function PlaceList({ places, status, sort, openNow, onRetry, onSelect }) {
  if (MESSAGES[status]) {
    return (
      <div className="list-message">
        <p>{MESSAGES[status]}</p>
        {status !== 'zoom' && (
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  const isLoading = status === 'loading' || status === 'idle';

  if (isLoading && places.length === 0) {
    return (
      <div className="list" aria-busy="true">
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
        <PlaceCardSkeleton />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="list-message">
        <p>
          {openNow
            ? 'Everything here is closed right now. Turn off Open now or try another area.'
            : 'Crickets. Nudge the map around or try another type.'}
        </p>
      </div>
    );
  }

  const badge = sort === 'rating' && places[0].rating == null ? null : BADGES[sort];

  return (
    <>
      <p className="list-count" aria-live="polite">
        {places.length} {places.length === 1 ? 'spot' : 'spots'} on the map{isLoading && ' · refreshing…'}
      </p>
      <ul className="list">
        {places.map((place, index) => (
          <li key={place.id}>
            <PlaceCard place={place} onSelect={onSelect} badge={index === 0 ? badge : null} />
          </li>
        ))}
      </ul>
    </>
  );
}
