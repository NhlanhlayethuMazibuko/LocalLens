const KINDS = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  fast_food: 'Fast food',
  bar: 'Bar',
  pub: 'Pub',
  ice_cream: 'Ice cream',
  hotel: 'Hotel',
  guest_house: 'Guest house',
  hostel: 'Hostel',
  motel: 'Motel',
  apartment: 'Apartment',
  attraction: 'Attraction',
  museum: 'Museum',
  gallery: 'Gallery',
  viewpoint: 'Viewpoint',
  zoo: 'Zoo',
  theme_park: 'Theme park',
  aquarium: 'Aquarium',
};

function pretty(text) {
  const clean = text.replace(/_/g, ' ').trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function safeUrl(value) {
  if (!value) return null;
  const url = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  return /^https?:\/\//i.test(url) ? url : null;
}

export function toPlace(element) {
  const tags = element.tags ?? {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null || !tags.name) return null;

  const kind = tags.amenity ?? tags.tourism;
  const category = KINDS[kind] ?? pretty(kind ?? 'Place');

  const chips = (tags.cuisine ?? '').split(';').filter(Boolean).slice(0, 2).map(pretty);
  if (['wlan', 'yes', 'wifi'].includes(tags.internet_access)) chips.push('Wi-Fi');
  if (tags.outdoor_seating === 'yes') chips.push('Outdoor seating');
  if (tags.wheelchair === 'yes') chips.push('Wheelchair access');

  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const address = [street, tags['addr:suburb'] ?? tags['addr:city']].filter(Boolean).join(', ');
  const phone = tags.phone ?? tags['contact:phone'] ?? null;

  return {
    id: `${element.type}/${element.id}`,
    name: tags.name,
    lat,
    lng,
    category,
    chips: chips.slice(0, 3),
    address,
    hours: tags.opening_hours ? tags.opening_hours.split(';')[0].trim() : null,
    allHours: tags.opening_hours ? tags.opening_hours.replace(/;\s*/g, '\n') : null,
    phone,
    phoneHref: phone ? `tel:${phone.split(';')[0].replace(/[^\d+]/g, '')}` : null,
    website: safeUrl(tags.website ?? tags['contact:website']),
    stars: tags.stars ?? null,
    description: tags.description ?? null,
  };
}

export function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function formatDistance(km) {
  if (km == null) return '';
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}
