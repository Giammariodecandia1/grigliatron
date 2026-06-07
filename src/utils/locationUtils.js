/**
 * Utility per estrapolare coordinate (lat, long) da link o testo (indirizzo/luogo).
 * Usa l'API gratuita di Open-Meteo per il geocoding come fallback.
 */
export async function extractCoordinates(locationName, locationAddress, mapsUrl) {
  // 1. Prova a estrarre coordinate da link lungo di Google Maps (es. contiene @lat,lng)
  if (mapsUrl) {
    const match = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
    }
    // Prova anche il formato ?q=lat,lng o /place/lat,lng
    const match2 = mapsUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match2) {
      return { latitude: parseFloat(match2[1]), longitude: parseFloat(match2[2]) };
    }
  }

  // 2. Geocoding: prova diverse query in ordine di probabilità di successo
  //    Open-Meteo geocoding funziona meglio con nomi di città/luoghi, non indirizzi stradali
  const queries = [];
  const name = locationName?.trim();
  const addr = locationAddress?.trim();

  // Prima il nome del luogo (es. "foligno") — più probabile che venga trovato
  if (name) queries.push(name);
  // Poi combina indirizzo + nome (es. "via Offman foligno")
  if (addr && name) queries.push(`${addr} ${name}`);
  // Infine l'indirizzo da solo
  if (addr && addr !== name) queries.push(addr);

  for (const query of queries) {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=it&format=json`
      );
      if (!res.ok) continue;

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        console.log(`📍 Geocoding riuscito per "${query}":`, data.results[0].name, data.results[0].latitude, data.results[0].longitude);
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude,
        };
      }
    } catch (err) {
      console.error(`Errore geocoding per "${query}":`, err);
    }
  }

  console.warn("📍 Geocoding fallito per tutti i tentativi:", { locationName, locationAddress, mapsUrl });
  return null;
}
