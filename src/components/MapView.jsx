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

function pinIcon(name, state) {
  return L.divIcon({
    className: 'pin-icon',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    html: `<div class="pin pin--${state}">
      <span class="pin__label">${escapeHtml(name)}</span>
      <svg width="36" height="44" viewBox="0 0 36 44" aria-hidden="true">
        <path class="pin__body" d="M18 43C18 43 33 28.5 33 17A15 15 0 0 0 3 17C3 28.5 18 43 18 43Z"/>
        <circle class="pin__dot" cx="18" cy="17" r="6"/>
      </svg>
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

export default function MapView({ initialCenter, places, selected, onSelect, onViewChange, flyTarget }) {
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

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={pinIcon(place.name, stateOf(place))}
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
