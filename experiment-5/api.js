console.log("JS loaded");
class WeatherError extends Error {
  constructor(message, code) {
    super(message); this.name = 'WeatherError'; this.code = code;
  }
}

const API_KEY  = 'ff22046840b43741c3ea373ceaea89a8'; 
const BASE     = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached(key) {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  const { data, ts } = JSON.parse(raw);
  return Date.now() - ts < CACHE_TTL ? data : null;
}
function setCache(key, data) {
  sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
}
async function apiFetch(url, cacheKey) {
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new WeatherError(err.message || `HTTP ${res.status}`, res.status);
  }
  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

export async function getWeatherByCity(city) {
  return apiFetch(
    `${BASE}/weather?q=${city}&appid=${API_KEY}&units=metric`,
    `weather_${city.toLowerCase()}`
  );
}
export async function getForecastByCity(city) {
  return apiFetch(
    `${BASE}/forecast?q=${city}&appid=${API_KEY}&units=metric&cnt=40`,
    `forecast_${city.toLowerCase()}`
  );
}
export async function getWeatherByCoords(lat, lon) {
  return apiFetch(
    `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`
  );
}
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation)
      reject(new WeatherError('Geolocation not supported', 0));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false, timeout: 8000
    });
  });
}