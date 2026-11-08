import { WeatherIcon } from './Icons.jsx';

export default function WeatherBadge({ weather }) {
  if (!weather) return null;
  return (
    <div className="weather" title="Weather right now, middle of the map">
      <WeatherIcon name={weather.icon} size={18} className="weather__icon" />
      <span>
        <strong>{weather.temp}°</strong>
        <span className="weather__label"> {weather.label}</span>
      </span>
    </div>
  );
}
