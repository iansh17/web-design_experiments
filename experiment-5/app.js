import { getWeatherByCity, getForecastByCity, getCurrentPosition, getWeatherByCoords } from './api.js';

const cityInput  = document.getElementById('cityInput');
const searchBtn  = document.getElementById('searchBtn');
const geoBtn     = document.getElementById('geoBtn');
const weatherDiv = document.getElementById('weather');
const loader     = document.getElementById('loader');
const errDiv     = document.getElementById('error');
const iconUrl = code => `https://openweathermap.org/img/wn/${code}@2x.png`;
let chartInstance = null;

function setLoading(state) {
  loader.hidden = !state;
  searchBtn.disabled = state;
  weatherDiv.hidden = true;
}
function showError(msg) {
  errDiv.textContent = msg; errDiv.hidden = false;
  setTimeout(() => errDiv.hidden = true, 5000);
}

async function loadWeather(city) {
  setLoading(true); errDiv.hidden = true;
  try {
    const [curResult, fctResult] = await Promise.allSettled([
      getWeatherByCity(city),
      getForecastByCity(city),
    ]);
    if (curResult.status === 'rejected') throw curResult.reason;
    renderCurrent(curResult.value);
    if (fctResult.status === 'fulfilled') renderForecast(fctResult.value);
    weatherDiv.hidden = false;
  } catch(e) {
    const msg = e.code === 404
      ? `City "${city}" not found.`
      : e.code === 401
      ? 'Invalid API key.'
      : `Error: ${e.message}`;
    showError(msg);
  } finally {
    setLoading(false);
  }
}

function renderCurrent(data) {
  const { name, sys, main, weather, wind, visibility } = data;
  document.getElementById('city-name').textContent  = `${name}, ${sys.country}`;
  document.getElementById('temp').textContent        = `${Math.round(main.temp)}°C`;
  document.getElementById('feels').textContent       = `Feels like ${Math.round(main.feels_like)}°C`;
  document.getElementById('desc').textContent        = weather[0].description;
  document.getElementById('humidity').textContent    = `${main.humidity}%`;
  document.getElementById('wind').textContent        = `${wind.speed} m/s`;
  document.getElementById('visibility').textContent  = `${(visibility/1000).toFixed(1)} km`;
  const icon = document.getElementById('icon');
  icon.src = iconUrl(weather[0].icon);
  icon.alt = weather[0].description;
}

function renderForecast(data) {
  const days = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });

  const container = document.getElementById('forecast-cards');
  container.innerHTML = '';
  Object.entries(days).slice(0, 5).forEach(([date, items]) => {
    const temps = items.map(i => i.main.temp);
    const max   = Math.max(...temps).toFixed(1);
    const min   = Math.min(...temps).toFixed(1);
    const icon  = items[Math.floor(items.length/2)].weather[0].icon;
    const d = new Date(date).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
    container.insertAdjacentHTML('beforeend', `
      <div class="forecast-card">
        <p class="fc-date">${d}</p>
        <img src="${iconUrl(icon)}" alt="" width="40">
        <p class="fc-max">${max}°</p>
        <p class="fc-min">${min}°</p>
      </div>
    `);
  });

  const next24 = data.list.slice(0, 8);
  const labels = next24.map(i => i.dt_txt.slice(11,16));
  const temps  = next24.map(i => i.main.temp);

  const ctx = document.getElementById('tempChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: '#1a56a5',
        backgroundColor: 'rgba(26,86,165,0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#d97706',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: {
        x: { grid: { display: false } },
        y: { title: { display: true, text: '°C' } }
      }
    }
  });
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) loadWeather(city);
});
cityInput.addEventListener('keydown', e => e.key === 'Enter' && searchBtn.click());

geoBtn.addEventListener('click', async () => {
  try {
    setLoading(true);
    const pos = await getCurrentPosition();
    const { latitude: lat, longitude: lon } = pos.coords;
    const data = await getWeatherByCoords(lat, lon);
    cityInput.value = data.name;
    loadWeather(data.name);
  } catch {
    showError('Could not get your location. Please allow location access.');
    setLoading(false);
  }
});