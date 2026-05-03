/**
 * Utility per estrapolare coordinate (lat, long) da link o testo (indirizzo/luogo).
 * Usa l'API gratuita di Open-Meteo per il geocoding come fallback.
 */
export async function extractCoordinates(locationName, locationAddress, mapsUrl) {
  // 1. Prova a estrarre direttamente dall'URL se è un link lungo di Google Maps (es. contiene @lat,lng)
  if (mapsUrl) {
    const match = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
    }
  }

  // 2. Se non abbiamo trovato nulla nel link (o è uno short link), proviamo il geocoding
  // Diamo priorità all'indirizzo, altrimenti usiamo il nome del luogo
  const query = locationAddress?.trim() || locationName?.trim();
  if (!query) return null;

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=it&format=json`);
    if (!res.ok) return null;
    
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
      };
    }
  } catch (err) {
    console.error("Errore durante il geocoding:", err);
  }

  return null;
}
