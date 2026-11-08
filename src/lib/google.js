import { distanceKm, safeUrl } from './places.js';

const TYPES = {
  restaurants: ['restaurant', 'cafe', 'bar', 'bakery'],
  hotels: ['lodging'],
  attractions: ['tourist_attraction', 'museum', 'art_gallery', 'zoo', 'aquarium', 'amusement_park'],
};

const LIST_FIELDS = [
  'id',
  'displayName',
  'location',
  'types',
  'primaryTypeDisplayName',
  'shortFormattedAddress',
  'rating',
  'userRatingCount',
  'priceLevel',
  'regularOpeningHours',
  'photos',
];

const DETAIL_FIELDS = [
  'formattedAddress',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteURI',
  'googleMapsURI',
  'editorialSummary',
  'reviews',
];

const PRICE = { FREE: 'Free', INEXPENSIVE: '$', MODERATE: '$$', EXPENSIVE: '$$$', VERY_EXPENSIVE: '$$$$' };

function todaysHours(weekdayDescriptions) {
  if (!weekdayDescriptions?.length) return null;
  const line = weekdayDescriptions[(new Date().getDay() + 6) % 7] ?? '';
  return line.replace(/^[^:]+:\s*/, 'Today: ');
}

function credit(photo) {
  const author = photo?.authorAttributions?.[0];
  return author ? { name: author.displayName, url: author.uri } : null;
}

function fromGoogle(gp) {
  const name = gp.displayName ?? 'Unnamed place';
  const photo = gp.photos?.[0];
  return {
    id: gp.id,
    name,
    lat: gp.location.lat(),
    lng: gp.location.lng(),
    category: gp.primaryTypeDisplayName ?? 'Place',
    chips: [],
    address: gp.shortFormattedAddress ?? '',
    hours: todaysHours(gp.regularOpeningHours?.weekdayDescriptions),
    allHours: gp.regularOpeningHours?.weekdayDescriptions?.join('\n') ?? null,
    rating: gp.rating ?? null,
    reviewCount: gp.userRatingCount ?? 0,
    price: PRICE[gp.priceLevel] ?? null,
    photoUrl: photo ? photo.getURI({ maxWidth: 400 }) : null,
    photoCredit: credit(photo),
    googlePlace: gp,
  };
}

export function searchRadiusKm(view) {
  const corner = { lat: view.bounds.north, lng: view.bounds.east };
  return Math.min(50, Math.max(0.3, distanceKm(view.center, corner)));
}

const searchCache = new Map();

export function searchNearby(placesLibrary, type, view) {
  const radius = searchRadiusKm(view);
  const key = [type, view.center.lat.toFixed(4), view.center.lng.toFixed(4), radius.toFixed(2)].join('|');
  if (!searchCache.has(key)) {
    const request = placesLibrary.Place.searchNearby({
      fields: LIST_FIELDS,
      locationRestriction: {
        center: new google.maps.LatLng(view.center.lat, view.center.lng),
        radius: Math.round(radius * 1000),
      },
      includedTypes: TYPES[type],
      maxResultCount: 20,
      rankPreference: 'POPULARITY',
      language: 'en',
    }).then(({ places }) => places.filter((p) => p.location).map(fromGoogle));
    request.catch(() => searchCache.delete(key));
    searchCache.set(key, request);
  }
  return searchCache.get(key);
}

const detailsCache = new Map();

export function loadDetails(place) {
  if (!detailsCache.has(place.id)) {
    const request = place.googlePlace.fetchFields({ fields: DETAIL_FIELDS }).then(({ place: gp }) => {
      const phone = gp.nationalPhoneNumber ?? gp.internationalPhoneNumber ?? null;
      const photo = gp.photos?.[0];
      return {
        address: gp.formattedAddress ?? place.address,
        phone,
        phoneHref: phone ? `tel:${(gp.internationalPhoneNumber ?? phone).replace(/[^\d+]/g, '')}` : null,
        website: safeUrl(gp.websiteURI),
        googleMapsUrl: safeUrl(gp.googleMapsURI),
        description: gp.editorialSummary ?? null,
        heroUrl: photo ? photo.getURI({ maxWidth: 1200 }) : null,
        reviews: (gp.reviews ?? []).slice(0, 5).map((r, i) => ({
          id: i,
          author: r.authorAttribution?.displayName ?? 'Google user',
          authorUrl: safeUrl(r.authorAttribution?.uri),
          authorPhoto: r.authorAttribution?.photoURI ?? null,
          rating: r.rating,
          when: r.relativePublishTimeDescription,
          text: r.text ?? '',
        })),
      };
    });
    request.catch(() => detailsCache.delete(place.id));
    detailsCache.set(place.id, request);
  }
  return detailsCache.get(place.id);
}
