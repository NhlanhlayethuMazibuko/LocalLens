import PlaceCard, { PlaceCardSkeleton } from './PlaceCard.jsx';

const MESSAGES = {
  zoom: "Zoom in a bit. We can't read the street signs from up here.",
  busy: 'The map servers are having a moment. Give them a few seconds.',
  error: "Can't reach the internet right now. Check your connection.",
  setup:
    "Google couldn't load places. Check that your API key and the Places API are set up (see the README).",
};

// The first card gets a big photo, depending on how the list is sorted.
const BADGES = {
  rating: 'Top rated nearby',
  reviews: 'Most reviewed nearby',
  distance: 'Closest to you',
};

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty">
      {icon && <span className="empty__icon">{icon}</span>}
      {title && <h2 className="empty__title">{title}</h2>}
      <p className="empty__text">{text}</p>
      {action}
    </div>
  );
}

export default function PlaceList({
  places,
  status,
  sort,
  openNow,
  empty,
  sortControl,
  isSaved,
  onToggleSave,
  onRetry,
  onSelect,
}) {
  if (MESSAGES[status]) {
    return (
      <EmptyState
        text={MESSAGES[status]}
        action={
          status !== 'zoom' && (
            <button type="button" className="btn btn--secondary" onClick={onRetry}>
              Try again
            </button>
          )
        }
      />
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
      empty ?? (
        <EmptyState
          text={
            openNow
              ? 'Everything here is closed right now. Turn off Open now or try another area.'
              : 'Crickets. Nudge the map around or try another type.'
          }
        />
      )
    );
  }

  const badge = sort === 'rating' && places[0].rating == null ? null : BADGES[sort];

  return (
    <>
      <div className="list-bar">
        <p className="list-bar__count" aria-live="polite">
          {places.length} {places.length === 1 ? 'place' : 'places'}
          {openNow && ' open now'}
          {isLoading && ' · refreshing…'}
        </p>
        {sortControl}
      </div>
      <ul className="list">
        {places.map((place, index) => (
          <li key={place.id}>
            <PlaceCard
              place={place}
              number={index + 1}
              badge={index === 0 ? badge : null}
              saved={isSaved?.(place.id)}
              onToggleSave={onToggleSave}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
