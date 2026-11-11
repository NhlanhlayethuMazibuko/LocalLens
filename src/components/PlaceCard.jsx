import { useState } from 'react';
import { CheckIcon, ChevronRightIcon, HeartIcon, NoPhotoIcon, StarIcon } from './Icons.jsx';
import { formatDistance, formatVisitDate, isOpenNow } from '../lib/places.js';

// Shimmers while the photo loads; says so plainly when there isn't one.
export function PlacePhoto({ place, url, className = '' }) {
  const src = url ?? place.photoUrl;
  const [state, setState] = useState(src ? 'loading' : 'none'); // loading | loaded | none

  return (
    <span className={`photo photo--${state} ${className}`}>
      {src && state !== 'none' && (
        <img
          src={src}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setState('loaded')}
          onError={() => setState('none')}
        />
      )}
      {state === 'none' && (
        <span className="photo__empty">
          <NoPhotoIcon size={20} />
          <span>No photo yet</span>
        </span>
      )}
    </span>
  );
}

// "★ 4.7 (1,588)  Burgers · $$ · 1.3 km away"
export function MetaLine({ place }) {
  const meta = [place.category, place.price, place.stars && `${place.stars}★`, formatDistance(place.distance)]
    .filter(Boolean)
    .join(' · ');
  return (
    <span className="meta">
      {place.rating != null && (
        <span className="meta__rating" aria-label={`Rated ${place.rating.toFixed(1)} out of 5`}>
          <StarIcon className="meta__star" />
          <strong>{place.rating.toFixed(1)}</strong>
          <span>({(place.reviewCount ?? 0).toLocaleString()})</span>
        </span>
      )}
      <span className="meta__text">{meta}</span>
    </span>
  );
}

// "● Open · 11:00 AM – 10:00 PM". Green and red are only ever used here.
export function StatusLine({ place }) {
  const open = isOpenNow(place);
  const hours = place.hours?.replace(/^Today:\s*/, '').replace(/^Open 24 hours$/, '24 hours');
  const showHours = hours && hours.toLowerCase() !== 'closed';
  if (open == null && !showHours) return null;
  return (
    <span className="status">
      {open != null && (
        <span className={`status__state status__state--${open ? 'open' : 'closed'}`}>
          <span className="status__dot" aria-hidden="true" />
          {open ? 'Open' : 'Closed'}
        </span>
      )}
      {showHours && (
        <span className="status__hours">
          {open != null && '· '}
          {hours}
        </span>
      )}
    </span>
  );
}

// The number matches the pin on the map.
export default function PlaceCard({ place, number, badge, saved, onSelect, onToggleSave }) {
  const featured = Boolean(badge);
  return (
    <div className={`card${featured ? ' card--featured' : ''}`}>
      <button type="button" className="card__main" onClick={() => onSelect(place)}>
        <span className="card__media">
          <PlacePhoto key={place.photoUrl} place={place} className="card__photo" />
          {!featured && <span className="num card__num">{number}</span>}
        </span>
        <span className="card__info">
          <span className="card__name">
            {featured && <span className="num">{number}</span>}
            {place.name}
          </span>
          <MetaLine place={place} />
          {place.visitedAt ? (
            <span className="card__visited">
              <CheckIcon size={14} /> Visited {formatVisitDate(place.visitedAt)}
            </span>
          ) : (
            <StatusLine place={place} />
          )}
        </span>
        {!featured && <ChevronRightIcon className="card__chevron" />}
      </button>

      {featured && (
        <>
          <span className="card__badge">
            <StarIcon /> {badge}
          </span>
          <button
            type="button"
            className={`icon-btn card__save${saved ? ' is-saved' : ''}`}
            onClick={() => onToggleSave(place)}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${place.name} from saved places` : `Save ${place.name}`}
          >
            <HeartIcon filled={saved} size={18} />
          </button>
        </>
      )}
    </div>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <div className="card__main">
        <span className="card__media">
          <span className="photo photo--loading card__photo" />
        </span>
        <span className="card__info">
          <span className="skeleton-line" style={{ width: '60%' }} />
          <span className="skeleton-line" style={{ width: '80%' }} />
          <span className="skeleton-line" style={{ width: '40%' }} />
        </span>
      </div>
    </div>
  );
}
