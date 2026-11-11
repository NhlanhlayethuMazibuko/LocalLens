import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function escapeHtml(text) {
  return text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

const TICK =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';

// A round pin. It shows the place's number in the list, or a tick on Been there.
function pinIcon(name, state, number, visited) {
  const inside = visited ? TICK : (number ?? '<span class="pin__dot"></span>');
  return L.divIcon({
    className: 'pin-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    html: `<div class="pin pin--${state}${visited ? ' pin--visited' : ''}">
      ${inside}
      <span class="pin__label">${escapeHtml(name)}</span>
    </div>`,
  });
}

function ViewWatcher({ onViewChange }) {
  const map = useMapEvents({ moveend: report });

  function report() {
    const b = map.getBounds();
    const c = map.getCenter();
    onViewChange({
      bounds: { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() },
      center: { lat: c.lat, lng: c.lng },
      zoom: map.getZoom(),
    });
  }

  useEffect(report, []);
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom ?? map.getZoom(), { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function MapView({
  initialCenter,
  places,
  selected,
  onSelect,
  onViewChange,
  flyTarget,
  visited,
}) {
  const selectedIsListed = selected && places.some((p) => p.id === selected.id);
  const stateOf = (place) => (!selected ? 'normal' : place.id === selected.id ? 'selected' : 'dim');

  return (
    <MapContainer
      className="map"
      center={[initialCenter.lat, initialCenter.lng]}
      zoom={15}
      zoomControl={false}
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <ZoomControl position="bottomright" />
      <ViewWatcher onViewChange={onViewChange} />
      <FlyTo target={flyTarget} />

      {places.map((place, index) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={pinIcon(place.name, stateOf(place), index + 1, visited)}
          zIndexOffset={selected?.id === place.id ? 1000 : 0}
          title={place.name}
          eventHandlers={{ click: () => onSelect(place) }}
        />
      ))}

      {selected && !selectedIsListed && (
        <Marker
          position={[selected.lat, selected.lng]}
          icon={pinIcon(selected.name, 'selected')}
          zIndexOffset={1000}
        />
      )}
    </MapContainer>
  );
}
