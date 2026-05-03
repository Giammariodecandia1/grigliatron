import { useState, useEffect } from 'react';

/**
 * Hook per recuperare le previsioni meteo da Open-Meteo API.
 * Gratuita, senza API key, supporta forecast fino a 16 giorni.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} targetDate - formato 'YYYY-MM-DD'
 * @returns {{ weather, loading, error }}
 */
export function useWeather(latitude, longitude, targetDate) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather(null);
      setError("Aggiungi le coordinate esatte (latitudine e longitudine) modificando l'evento per sbloccare il meteo.");
      setLoading(false);
      return;
    }

    if (!targetDate) {
      setWeather(null);
      setError("Data dell'evento mancante.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        // Check how far in the future the target date is
        const now = new Date();
        const target = new Date(targetDate);
        const daysDiff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

        let url;
        if (daysDiff > 16) {
          // Too far for forecast, no data available
          if (!cancelled) {
            setWeather(null);
            setError('Le previsioni meteo non sono ancora disponibili per questa data (max 16 giorni in anticipo).');
            setLoading(false);
          }
          return;
        } else if (daysDiff < 0) {
          // Past date: use historical API
          url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${targetDate}&end_date=${targetDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=Europe%2FRome`;
        } else {
          // Future date within 16 days: use forecast API
          url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,windspeed_10m_max,weathercode&timezone=Europe%2FRome&start_date=${targetDate}&end_date=${targetDate}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Errore API meteo');

        const data = await response.json();

        if (!cancelled && data.daily) {
          const daily = data.daily;
          const idx = 0; // We only request one day

          const weatherData = {
            tempMax: daily.temperature_2m_max?.[idx],
            tempMin: daily.temperature_2m_min?.[idx],
            precipitationProbability: daily.precipitation_probability_max?.[idx],
            precipitationSum: daily.precipitation_sum?.[idx],
            windSpeed: daily.windspeed_10m_max?.[idx],
            weatherCode: daily.weathercode?.[idx],
            description: getWeatherDescription(daily.weathercode?.[idx]),
            icon: getWeatherIcon(daily.weathercode?.[idx]),
            advice: getWeatherAdvice(daily.weathercode?.[idx], daily.temperature_2m_max?.[idx]),
          };

          setWeather(weatherData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Errore nel recupero meteo');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, [latitude, longitude, targetDate]);

  return { weather, loading, error };
}

function getWeatherDescription(code) {
  const descriptions = {
    0: 'Cielo sereno',
    1: 'Prevalentemente sereno',
    2: 'Parzialmente nuvoloso',
    3: 'Nuvoloso',
    45: 'Nebbia',
    48: 'Nebbia con brina',
    51: 'Pioggerella leggera',
    53: 'Pioggerella moderata',
    55: 'Pioggerella intensa',
    61: 'Pioggia leggera',
    63: 'Pioggia moderata',
    65: 'Pioggia intensa',
    71: 'Neve leggera',
    73: 'Neve moderata',
    75: 'Neve intensa',
    80: 'Rovesci leggeri',
    81: 'Rovesci moderati',
    82: 'Rovesci intensi',
    95: 'Temporale',
    96: 'Temporale con grandine leggera',
    99: 'Temporale con grandine',
  };
  return descriptions[code] || 'Condizioni sconosciute';
}

function getWeatherIcon(code) {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '🌨️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function getWeatherAdvice(code, tempMax) {
  if (code >= 95) return 'Temporale previsto! Valuta un piano B al coperto.';
  if (code >= 61 && code <= 65) return 'Pioggia prevista. Porta un ombrello o un telo!';
  if (code >= 80 && code <= 82) return 'Possibili rovesci. Cerca un riparo vicino!';
  if (code >= 51 && code <= 55) return 'Possibile pioggerella. Un k-way non guasta.';
  if (tempMax !== null && tempMax < 10) return 'Freschetto! Copriti bene e porta legna extra.';
  if (tempMax !== null && tempMax < 18) return 'Porta una felpa leggera, non si sa mai.';
  if (tempMax !== null && tempMax > 30) return 'Caldo! Porta acqua extra e cerca l\'ombra.';
  return 'Tempo buono! Perfetto per una grigliata. 🔥';
}
