import { ChevronLeftIcon, ClockIcon, GlobeIcon, HeartIcon, PhoneIcon, PinIcon } from './Icons.jsx';
import { PlacePhoto, RatingLine } from './PlaceCard.jsx';
import Stars from './Stars.jsx';
import { formatDistance } from '../lib/places.js';

function InfoRow({ icon, label, value, href }) {
  return (
    <li className="info-row">
      <span className="info-row__icon">{icon}</span>
      <span className="info-row__text">
        <span className="info-row__label">{label}</span>
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
            {review.author.charAt(0)}
          </span>
        )}
        <div>
          <div className="review__author">{author}</div>
          <div className="review__meta">
            {review.rating != null && <Stars rating={review.rating} size={12} />} {review.when}
          </div>
        </div>
      </div>
      {review.text && <p className="review__text">{review.text}</p>}
    </li>
  );
}

export default function PlaceDetails({ place, saved, onToggleSave, onBack }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const subtitle = [
    place.category,
    place.price,
    place.stars && `${place.stars}★`,
    formatDistance(place.distance),
  ]
    .filter(Boolean)
    .join(' · ');
  const loading = !place.detailsLoaded;
  const missing = (text) => (loading ? 'Loading…' : text);

  return (
    <article className="details">
      <button type="button" className="details__back-link" onClick={onBack}>
        <ChevronLeftIcon size={16} /> Back to the list
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
          className="round-btn details__back-round"
          onClick={onBack}
          aria-label="Back to the list"
        >
          <ChevronLeftIcon />
        </button>
        <button
          type="button"
          className={`round-btn details__save${saved ? ' is-saved' : ''}`}
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from saved places' : 'Save this place'}
        >
          <HeartIcon filled={saved} />
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
          <h2>{place.name}</h2>
          <RatingLine place={place} size={16} />
          <p className="muted">{subtitle}</p>
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
            Take me there
          </a>
          {place.phoneHref ? (
            <a className="btn btn--secondary" href={place.phoneHref}>
              Call
            </a>
          ) : (
            <span className="btn btn--secondary is-disabled" aria-disabled="true">
              {loading ? 'Call' : 'No number listed'}
            </span>
          )}
        </div>

        <ul className="info">
          <InfoRow
            icon={<PinIcon size={20} />}
            label="Address"
            value={place.address || missing('No address listed')}
          />
          <InfoRow
            icon={<ClockIcon />}
            label="Hours"
            value={place.allHours || missing('No hours listed. Call ahead?')}
          />
          {(place.phone || loading) && (
            <InfoRow
              icon={<PhoneIcon />}
              label="Phone"
              value={place.phone || 'Loading…'}
              href={place.phoneHref}
            />
          )}
          {place.website && (
            <InfoRow
              icon={<GlobeIcon />}
              label="Website"
              value={place.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              href={place.website}
            />
          )}
        </ul>

        {(place.description || !place.googlePlace) && (
          <section className="about">
            <h3>The lowdown</h3>
            <p className="muted">
              {place.description ??
                `${place.category}${place.address ? ` on ${place.address}` : ''}. Info comes from OpenStreetMap, the map anyone can edit, so if something's off, you can fix it there.`}
            </p>
          </section>
        )}

        {place.reviews?.length > 0 && (
          <section className="about">
            <h3>What people are saying</h3>
            <ul className="reviews">
              {place.reviews.map((review) => (
                <Review key={review.id} review={review} />
              ))}
            </ul>
            {place.googleMapsUrl && (
              <a className="details__more" href={place.googleMapsUrl} target="_blank" rel="noreferrer">
                Read every review on Google Maps →
              </a>
            )}
          </section>
        )}

        <p className="credit">
          {place.googlePlace ? 'Place data © Google' : 'Place data © OpenStreetMap contributors'}
        </p>
      </div>
    </article>
  );
}
