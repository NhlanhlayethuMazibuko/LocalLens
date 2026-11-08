import { useState } from 'react';
import { NoPhotoIcon, PinIcon } from './Icons.jsx';
import Stars from './Stars.jsx';
import { formatDistance } from '../lib/places.js';

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
          <NoPhotoIcon size={22} />
          <span>No photo yet</span>
        </span>
      )}
    </span>
  );
}

export function RatingLine({ place, size }) {
  if (place.rating == null) return null;
  return (
    <span className="rating">
      <Stars rating={place.rating} size={size} />
      <span>
        <strong>{place.rating.toFixed(1)}</strong> ({place.reviewCount.toLocaleString()})
      </span>
    </span>
  );
}

export default function PlaceCard({ place, onSelect, badge }) {
  const meta = [place.category, place.price, formatDistance(place.distance)].filter(Boolean).join(' · ');
  return (
    <button type="button" className={`card${badge ? ' card--featured' : ''}`} onClick={() => onSelect(place)}>
      <PlacePhoto key={place.photoUrl} place={place} className="card__photo" />
      {badge && <span className="card__badge">{badge}</span>}
      <span className="card__info">
        <span className="card__name">{place.name}</span>
        <RatingLine place={place} />
        <span className="card__meta">{meta}</span>
        {place.address && (
          <span className="card__row">
            <PinIcon /> {place.address}
          </span>
        )}
        {place.hours && <span className="card__hours">{place.hours}</span>}
        {place.chips.length > 0 && (
          <span className="chips">
            {place.chips.map((chip) => (
              <span key={chip} className="chip">
                {chip}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <span className="photo photo--loading card__photo" />
      <span className="card__info">
        <span className="skeleton-line" style={{ width: '60%' }} />
        <span className="skeleton-line" style={{ width: '40%' }} />
        <span className="skeleton-line" style={{ width: '75%' }} />
      </span>
    </div>
  );
}
