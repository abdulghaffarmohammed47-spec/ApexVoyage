/* ═══════════════════════════════════════════════════════════════
   ApexVoyage Data Gateway — Async Fetch Hub with Cache & Abort
   ═══════════════════════════════════════════════════════════════ */

// ─── In-Memory Cache (Map-Based, 5-Minute TTL) ───
const responseCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCachedResponse(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResponse(key, data) {
  responseCache.set(key, { data, timestamp: Date.now() });
  // Evict oldest entries if cache exceeds 50 items
  if (responseCache.size > 50) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
}

// ─── Weather Code to Description Map ───
const WEATHER_DESCRIPTIONS = {
  0: { desc: 'Clear Sky', icon: '☀️' },
  1: { desc: 'Mainly Clear', icon: '🌤️' },
  2: { desc: 'Partly Cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫️' },
  48: { desc: 'Rime Fog', icon: '🌫️' },
  51: { desc: 'Light Drizzle', icon: '🌦️' },
  53: { desc: 'Moderate Drizzle', icon: '🌦️' },
  55: { desc: 'Dense Drizzle', icon: '🌧️' },
  61: { desc: 'Slight Rain', icon: '🌧️' },
  63: { desc: 'Moderate Rain', icon: '🌧️' },
  65: { desc: 'Heavy Rain', icon: '🌧️' },
  71: { desc: 'Slight Snow', icon: '🌨️' },
  73: { desc: 'Moderate Snow', icon: '❄️' },
  75: { desc: 'Heavy Snow', icon: '❄️' },
  80: { desc: 'Rain Showers', icon: '🌦️' },
  81: { desc: 'Moderate Showers', icon: '🌧️' },
  82: { desc: 'Violent Showers', icon: '⛈️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm w/ Hail', icon: '⛈️' },
  99: { desc: 'Severe Thunderstorm', icon: '⛈️' },
};

function interpretWeatherCode(code) {
  return WEATHER_DESCRIPTIONS[code] || { desc: 'Unknown', icon: '🌡️' };
}

// ─── Safe JSON Fetch Helper ───
async function safeFetch(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// ─── Primary Export: Fetch Destination Visuals & Weather ───
export async function fetchDestinationData(cityName, lat, lon, abortSignal) {
  const cacheKey = `dest_${cityName}_${lat}_${lon}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Concurrent API calls using Promise.all
    const [weatherData, geoData] = await Promise.all([
      // Open-Meteo: Free weather API (no API key required)
      safeFetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m&timezone=auto&forecast_days=1`,
        abortSignal
      ).catch(() => null),

      // Nominatim OpenStreetMap: Free geocoding verification
      safeFetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`,
        abortSignal
      ).catch(() => null),
    ]);

    // Parse weather result
    let weather = null;
    if (weatherData && weatherData.current_weather) {
      const cw = weatherData.current_weather;
      const interpretation = interpretWeatherCode(cw.weathercode);
      weather = {
        temperature: Math.round(cw.temperature),
        windSpeed: Math.round(cw.windspeed),
        description: interpretation.desc,
        icon: interpretation.icon,
        humidity: weatherData.hourly?.relative_humidity_2m?.[0] ?? null,
      };
    }

    // Refine coordinates from geocoding
    let refinedLat = lat;
    let refinedLon = lon;
    if (geoData && geoData.length > 0) {
      refinedLat = parseFloat(geoData[0].lat);
      refinedLon = parseFloat(geoData[0].lon);
    }

    const result = {
      weather: weather || {
        temperature: 22,
        windSpeed: 12,
        description: 'Partly Cloudy',
        icon: '⛅',
        humidity: 65,
      },
      coordinates: { lat: refinedLat, lon: refinedLon },
      fetchedAt: Date.now(),
    };

    setCachedResponse(cacheKey, result);
    return result;
  } catch (err) {
    if (err.name === 'AbortError') {
      return null;
    }
    // Return fallback data on network failure
    console.warn('DataGateway fetch failed, using fallback:', err.message);
    return {
      weather: {
        temperature: 22,
        windSpeed: 12,
        description: 'Data Unavailable',
        icon: '🌡️',
        humidity: null,
      },
      coordinates: { lat, lon },
      fetchedAt: Date.now(),
    };
  }
}

// ─── Exchange Rate Fetching ───
export async function fetchExchangeRates(abortSignal) {
  const cacheKey = 'exchange_rates_usd';
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  try {
    // Open Exchange Rates (no API key required for limited use via open.er-api.com)
    const data = await safeFetch(
      'https://open.er-api.com/v6/latest/USD',
      abortSignal
    );

    if (data && data.rates) {
      const result = {
        base: 'USD',
        rates: data.rates,
        timestamp: data.time_last_update_unix ? data.time_last_update_unix * 1000 : Date.now(),
      };
      setCachedResponse(cacheKey, result);
      return result;
    }
    return null;
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.warn('Exchange rate fetch failed:', err.message);
    return null;
  }
}

// ─── Destination Search (geocoding only) ───
export async function searchCityCoordinates(cityName, abortSignal) {
  const cacheKey = `geocode_${cityName.toLowerCase()}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  try {
    const data = await safeFetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=5`,
      abortSignal
    );

    if (data && data.length > 0) {
      const result = data.map(item => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
      }));
      setCachedResponse(cacheKey, result);
      return result;
    }
    return [];
  } catch (err) {
    if (err.name === 'AbortError') return null;
    console.warn('Geocoding fetch failed:', err.message);
    return [];
  }
}

// ─── Utility: Clear cache manually ───
export function clearCache() {
  responseCache.clear();
}

// ─── Utility: Get cache stats ───
export function getCacheStats() {
  return {
    size: responseCache.size,
    keys: Array.from(responseCache.keys()),
  };
}
