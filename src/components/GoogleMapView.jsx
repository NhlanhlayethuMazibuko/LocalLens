import { useEffect, useRef } from 'react';
import { AdvancedMarker, Map, useMap } from '@vis.gl/react-google-maps';
import { GOOGLE_MAP_ID } from '../lib/config.js';

function Pin({ name, state }) {
  return (
    <div className={`pin pin--${state}`}>
      <span className="pin__label">{name}</span>
      <svg width="36" height="44" viewBox="0 0 36 44" aria-hidden="true">
        <path className="pin__body" d="M18 43C18 43 33 28.5 33 17A15 15 0 0 0 3 17C3 28.5 18 43 18 43Z" />
        <circle className="pin__dot" cx="18" cy="17" r="6" />
      </svg>
    </div>
  );
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo({ lat: target.lat, lng: target.lng });
    if (target.zoom) map.setZoom(target.zoom);
  }, [map, target]);
  return null;
}

export default function GoogleMapView({
  initialCenter,
  places,
  selected,
  onSelect,
  onViewChange,
  flyTarget,
  theme,
}) {
  const camera = useRef({ center: initialCenter, zoom: 15 });

  function handleIdle({ map }) {
    const bounds = map.getBounds();
    const center = map.getCenter();
    if (!bounds || !center) return;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    camera.current = { center: { lat: center.lat(), lng: center.lng() }, zoom: map.getZoom() };
    onViewChange({
      bounds: { south: sw.lat(), west: sw.lng(), north: ne.lat(), east: ne.lng() },
      center: camera.current.center,
      zoom: camera.current.zoom,
    });
  }

  const selectedIsListed = selected && places.some((p) => p.id === selected.id);
  const stateOf = (place) => (!selected ? 'normal' : place.id === selected.id ? 'selected' : 'dim');

  return (
    <Map
      key={theme}
      className="map"
      mapId={GOOGLE_MAP_ID}
      defaultCenter={camera.current.center}
      defaultZoom={camera.current.zoom}
      colorScheme={theme === 'dark' ? 'DARK' : 'LIGHT'}
      gestureHandling="greedy"
      disableDefaultUI
      zoomControl={window.innerWidth >= 768}
      clickableIcons={false}
      onIdle={handleIdle}
    >
      <FlyTo target={flyTarget} />

      {places.map((place) => (
        <AdvancedMarker
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          zIndex={selected?.id === place.id ? 1000 : undefined}
          onClick={() => onSelect(place)}
        >
          <Pin name={place.name} state={stateOf(place)} />
        </AdvancedMarker>
      ))}

      {selected && !selectedIsListed && (
        <AdvancedMarker position={{ lat: selected.lat, lng: selected.lng }} zIndex={1000}>
          <Pin name={selected.name} state="selected" />
        </AdvancedMarker>
      )}
    </Map>
  );
}
