import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  DirectionsIcon,
  GlobeIcon,
  HeartIcon,
  PhoneIcon,
  PinIcon,
  ShareIcon,
} from './Icons.jsx';
import { MetaLine, PlacePhoto, StatusLine } from './PlaceCard.jsx';
import Stars from './Stars.jsx';
import { formatVisitDate, placeUrl } from '../lib/places.js';

function InfoRow({ icon, label, value, href }) {
  return (
    <li className="info-row">
      <span className="info-row__icon">{icon}</span>
      <span className="info-row__text">
        <span className="visually-hidden">{label}: </span>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer">
            {value}
          </a>
        ) : (
          <span className="info-row__value">{value}</span>
        )}
      </span>
    </li>
  );
}

// Phones get their own share sheet; everywhere else the link is copied.
function ShareButton({ place }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function share() {
    const url = placeUrl(place.id);
    const onPhone = window.matchMedia('(pointer: coarse)').matches;
    try {
      if (navigator.share && onPhone) {
        await navigator.share({ title: place.name, text: `${place.name} on LocalLens`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch (error) {
      // AbortError just means the share sheet was closed.
      if (error.name !== 'AbortError') window.prompt('Copy this link:', url);
    }
  }

  return (
    <button
      type="button"
      className={`btn btn--secondary btn--icon${copied ? ' is-copied' : ''}`}
      onClick={share}
      aria-label="Share this place"
      title="Share this place"
    >
      {copied ? <CheckIcon size={16} /> : <ShareIcon />}
      <span className="share-note" role="status">
        {copied && 'Link copied'}
      </span>
    </button>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function Review({ review }) {
  const author = review.authorUrl ? (
    <a href={review.authorUrl} target="_blank" rel="noreferrer">
      {review.author}
    </a>
  ) : (
    review.author
  );
  return (
    <li className="review">
      <div className="review__head">
        {review.authorPhoto ? (
          <img className="review__avatar" src={review.authorPhoto} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="review__avatar" aria-hidden="true">
            {initials(review.author)}
          </span>
        )}
        <div className="review__who">
          <div className="review__author">{author}</div>
          <div className="review__when">{review.when}</div>
        </div>
        {review.rating != null && <Stars rating={review.rating} size={12} />}
      </div>
      {review.text && <p className="review__text">{review.text}</p>}
    </li>
  );
}

export default function PlaceDetails({ place, saved, visitedAt, onToggleSave, onToggleVisited, onBack }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const loading = !place.detailsLoaded;
  const missing = (text) => (loading ? 'Loading…' : text);

  return (
    <article className="details">
      <button type="button" className="details__back-link" onClick={onBack}>
        <ArrowLeftIcon /> Back to results
      </button>

      <div className="details__hero">
        <PlacePhoto
          key={place.heroUrl ?? place.photoUrl}
          place={place}
          url={place.heroUrl}
          className="details__photo"
        />
        <button
          type="button"
          className="icon-btn details__back-round"
          onClick={onBack}
          aria-label="Back to results"
        >
          <ArrowLeftIcon size={18} />
        </button>
        <button
          type="button"
          className={`icon-btn details__save${saved ? ' is-saved' : ''}`}
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved places' : 'Save this place'}
        >
          <HeartIcon filled={saved} size={18} />
        </button>
        {place.photoCredit && (
          <span className="details__credit">
            Photo:{' '}
            {place.photoCredit.url ? (
              <a href={place.photoCredit.url} target="_blank" rel="noreferrer">
                {place.photoCredit.name}
              </a>
            ) : (
              place.photoCredit.name
            )}
          </span>
        )}
      </div>

      <div className="details__body">
        <div className="details__title">
          <h1>{place.name}</h1>
          <MetaLine place={place} />
          <StatusLine place={place} />
          {place.chips.length > 0 && (
            <div className="chips">
              {place.chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="details__actions">
          <a className="btn btn--primary" href={directionsUrl} target="_blank" rel="noreferrer">
            <DirectionsIcon /> Directions
          </a>
          {place.phoneHref && (
            <a className="btn btn--secondary" href={place.phoneHref}>
              <PhoneIcon size={16} /> Call
            </a>
          )}
          {place.website && (
            <a
              className="btn btn--secondary btn--website"
              href={place.website}
              target="_blank"
              rel="noreferrer"
              aria-label="Website"
            >
              <GlobeIcon size={16} /> <span className="btn__label">Website</span>
            </a>
          )}
          <ShareButton place={place} />
        </div>

        <button type="button" className="visit" aria-pressed={Boolean(visitedAt)} onClick={onToggleVisited}>
          <span className="visit__check" aria-hidden="true">
            {visitedAt && <CheckIcon size={14} />}
          </span>
          <span className="visit__text">
            <strong>{visitedAt ? "You've been here" : "I've been here"}</strong>
            <span>
              {visitedAt ? `Visited ${formatVisitDate(visitedAt)}` : 'Adds it to your Been there list'}
            </span>
          </span>
        </button>

        <ul className="info">
          <InfoRow
            icon={<PinIcon size={18} />}
            label="Address"
            value={place.address || missing('No address listed')}
          />
          <InfoRow
            icon={<ClockIcon size={18} />}
            label="Hours"
            value={place.allHours || missing('No hours listed. Call ahead?')}
          />
          {(place.phone || loading) && (
            <InfoRow
              icon={<PhoneIcon size={18} />}
              label="Phone"
              value={place.phone || 'Loading…'}
              href={place.phoneHref}
            />
          )}
          {place.website && (
            <InfoRow
              icon={<GlobeIcon size={18} />}
              label="Website"
              value={place.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              href={place.website}
            />
          )}
        </ul>

        {(place.description || !place.googlePlace) && (
          <section className="section">
            <div className="section__head">
              <h2>About</h2>
            </div>
            <p className="muted">
              {place.description ??
                `${place.category}${place.address ? ` on ${place.address}` : ''}. Info comes from OpenStreetMap, the map anyone can edit, so if something's off, you can fix it there.`}
            </p>
          </section>
        )}

        {place.reviews?.length > 0 && (
          <section className="section">
            <div className="section__head">
              <h2>Reviews</h2>
              {place.googleMapsUrl && (
                <a href={place.googleMapsUrl} target="_blank" rel="noreferrer">
                  See all {(place.reviewCount ?? 0).toLocaleString()}
                </a>
              )}
            </div>
            <ul className="reviews">
              {place.reviews.map((review) => (
                <Review key={review.id} review={review} />
              ))}
            </ul>
          </section>
        )}

        <p className="credit">
          {place.googlePlace ? 'Place data © Google' : 'Place data © OpenStreetMap contributors'}
        </p>
      </div>
    </article>
  );
}
