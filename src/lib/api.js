import { toPlace } from './places.js';

const OVERPASS_SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const NEXT_SERVER_AFTER_MS = 8000;
const SERVER_TIMEOUT_MS = 40000;

function askServers(body, signal) {
  const controller = new AbortController();
  const cancelAll = () => controller.abort();
  signal.addEventListener('abort', cancelAll);

  return new Promise((resolve, reject) => {
    let next = 0;
    let running = 0;
    let lastError = new Error('busy');

    function askNext() {
      if (next >= OVERPASS_SERVERS.length || controller.signal.aborted) return;
      const server = OVERPASS_SERVERS[next++];
      running++;
      fetch(server, {
        method: 'POST',
        body,
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(SERVER_TIMEOUT_MS)]),
      })
        .then(async (response) => {
          if (!response.ok)
            throw new Error(response.status === 429 || response.status === 504 ? 'busy' : 'failed');
          resolve(await response.json());
        })
        .catch((error) => {
          running--;
          if (signal.aborted) return reject(error);
          if (controller.signal.aborted) return;
          lastError = error.name === 'TimeoutError' ? new Error('busy') : error;
          if (next < OVERPASS_SERVERS.length) askNext();
          else if (running === 0) reject(lastError);
        });
    }

    askNext();
    const timer = setInterval(askNext, NEXT_SERVER_AFTER_MS);
    controller.signal.addEventListener('abort', () => clearInterval(timer));
  }).finally(() => {
    signal.removeEventListener('abort', cancelAll);
    controller.abort();
  });
}

const QUERIES = {
  restaurants: 'nwr["amenity"~"^(restaurant|cafe|fast_food|bar|pub|ice_cream)$"]["name"]',
  hotels: 'nwr["tourism"~"^(hotel|guest_house|hostel|motel|apartment)$"]["name"]',
  attractions: 'nwr["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium)$"]["name"]',
};

export async function fetchPlaces(type, bounds, signal) {
  const bbox = [bounds.south, bounds.west, bounds.north, bounds.east].map((n) => n.toFixed(5)).join(',');
  const query = `[out:json][timeout:25];${QUERIES[type]}(${bbox});out center 80;`;

  const data = await askServers(new URLSearchParams({ data: query }), signal);
  return data.elements.map(toPlace).filter(Boolean);
}

export async function searchLocations(text, signal) {
  const params = new URLSearchParams({ q: text, format: 'jsonv2', limit: '5', 'accept-language': 'en' });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { signal });
  if (!response.ok) throw new Error('failed');

  const results = await response.json();
  return results.map((r) => ({
    id: r.place_id,
    name: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}

// Weather codes 
function describeWeather(code, isDay) {
  if (code === 0) return isDay ? ['Sunny', 'sun'] : ['Clear night', 'moon'];
  if (code <= 2) return ['Bit of cloud', 'partly'];
  if (code === 3) return ['Grey skies', 'cloud'];
  if (code <= 48) return ['Foggy', 'fog'];
  if (code <= 67) return ['Rainy', 'rain'];
  if (code <= 77) return ['Snow!', 'snow'];
  if (code <= 82) return ['Showers', 'rain'];
  return ['Stormy', 'storm'];
}

export async function fetchWeather({ lat, lng }, signal) {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lng.toFixed(3),
    current: 'temperature_2m,weather_code,is_day',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error('failed');

  const { current } = await response.json();
  const [label, icon] = describeWeather(current.weather_code, current.is_day === 1);
  return { temp: Math.round(current.temperature_2m), label, icon };
}
