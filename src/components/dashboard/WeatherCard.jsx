import { useEvent } from '../../contexts/EventContext';
import { useWeather } from '../../hooks/useWeather';
import Card from '../shared/Card';
import { getTheme } from '../../config/themes';
import { formatDateWithDay } from '../../utils/formatters';

/**
 * Card Meteo con dati da Open-Meteo API.
 */
export default function WeatherCard() {
  const { event } = useEvent();
  const theme = getTheme(event?.theme || event?.type);

  const { weather, loading, error } = useWeather(
    event?.latitude,
    event?.longitude,
    event?.date
  );

  if (!event) return null;

  return (
    <Card
      title="Meteo evento"
      emoji={theme.sectionEmojis.weather}
      id="weather-card"
    >
      {loading ? (
        <div className="weather-loading">
          <span className="spinner">🌀</span>
          <p>Caricamento meteo...</p>
        </div>
      ) : error ? (
        <div className="weather-error" style={{ textAlign: 'center', padding: '1rem' }}>
          <span className="weather-icon-large" style={{ opacity: 0.5 }}>🤷‍♂️</span>
          <p className="weather-error-text" style={{ color: 'var(--text-muted)' }}>{error}</p>
        </div>
      ) : weather ? (
        <div className="weather-data">
          <div className="weather-header-row">
            <span className="weather-icon-large">{weather.icon}</span>
            <div className="weather-temp">
              <span className="weather-temp-max">{Math.round(weather.tempMax)}°C</span>
              <span className="weather-temp-min">{Math.round(weather.tempMin)}°C min</span>
            </div>
          </div>

          <p className="weather-description">{weather.description}</p>

          <div className="weather-details">
            {weather.precipitationProbability != null && (
              <div className="weather-detail">
                <span>🌧️</span>
                <span>Pioggia: {weather.precipitationProbability}%</span>
              </div>
            )}
            {weather.windSpeed != null && (
              <div className="weather-detail">
                <span>💨</span>
                <span>Vento: {Math.round(weather.windSpeed)} km/h</span>
              </div>
            )}
            {weather.precipitationSum != null && weather.precipitationSum > 0 && (
              <div className="weather-detail">
                <span>💧</span>
                <span>Precipitazioni: {weather.precipitationSum} mm</span>
              </div>
            )}
          </div>

          <div className="weather-advice">
            <span>💡</span>
            <p>{weather.advice}</p>
          </div>

          <p className="weather-meta">
            Previsione per {formatDateWithDay(event.date)}{event.time ? `, ${event.time}` : ''}
          </p>
        </div>
      ) : (
        <div className="weather-unavailable">
          <span className="weather-icon-large">🌤️</span>
          <p>Meteo non ancora disponibile.</p>
        </div>
      )}
    </Card>
  );
}
