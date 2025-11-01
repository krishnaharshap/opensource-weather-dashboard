// Minimal demo frontend logic to work with the mock backend (json-server) at /api
// This is only for local demo / testing and intentionally simple.

const apiBase = (window.__env && window.__env.API_BASE_URL) || '/api';
const authTokenKey = 'authToken';

// Simple helpers
async function apiRequest(path, options = {}) {
  const headers = options.headers || {};
  const token = window.localStorage.getItem(authTokenKey);
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch(apiBase + path, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...options
  });
  return resp.json().catch(() => ({}));
}

// Auth: call /api/auth/login to get token (the mock backend returns token-demo-user)
async function loginDemo() {
  const resp = await fetch(apiBase + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo-user', password: 'password123' })
  });
  if (resp.ok) {
    const body = await resp.json();
    if (body.token) {
      window.localStorage.setItem(authTokenKey, body.token);
    }
  }
}

// City UI
const cityInput = document.getElementById('city-input');
const addBtn = document.getElementById('city-add-btn');
const cardsContainer = document.getElementById('city-cards');

function createCityCard(cityName, tempText) {
  const id = cityName.replace(/\s+/g, '-');
  const wrapper = document.createElement('div');
  wrapper.className = 'city-card';
  wrapper.setAttribute('data-cy', `city-card-${cityName}`);
  wrapper.innerHTML = `
    <h3>${cityName}</h3>
    <div data-cy="temp">${tempText || '-'}</div>
    <button data-action="remove" data-city="${cityName}">Remove</button>
  `;
  return wrapper;
}

async function addCity(cityName) {
  // Simulate calling external weather API - Cypress intercept will usually stub it.
  // For demo simply show placeholder temp and call backend POST
  const weatherResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}`)
    .then(r => r.json())
    .catch(() => ({}));

  const temp = (weatherResp && weatherResp.main && Math.round(weatherResp.main.temp - 273.15)) || 'N/A';

  // POST to backend to persist
  await fetch(apiBase + '/users/demo-user/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem(authTokenKey) || ''}` },
    body: JSON.stringify({ name: cityName, temp, lat: weatherResp.coord && weatherResp.coord.lat, lon: weatherResp.coord && weatherResp.coord.lon })
  }).catch(() => null);

  // render card
  const existing = document.querySelector(`[data-cy="city-card-${cityName}"]`);
  if (!existing) {
    const card = createCityCard(cityName, `${temp}°C`);
    cardsContainer.appendChild(card);
  }
}

addBtn.addEventListener('click', () => {
  const name = cityInput.value && cityInput.value.trim();
  if (!name) return;
  addCity(name);
  cityInput.value = '';
});

cardsContainer.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="remove"]');
  if (!btn) return;
  const city = btn.getAttribute('data-city');
  // remove in UI and call backend to remove (simplified)
  const card = document.querySelector(`[data-cy="city-card-${city}"]`);
  if (card) card.remove();
  // backend delete (if implemented)
  // await apiRequest(`/users/demo-user/cities/${city}`, { method: 'DELETE' });
});

// Alerts modal
const openAlertBtn = document.getElementById('open-alert-modal');
const alertModal = document.getElementById('alert-modal');
const saveAlertBtn = document.getElementById('save-alert');
const closeAlertBtn = document.getElementById('close-alert');
const notifContainer = document.getElementById('notifications');

openAlertBtn.addEventListener('click', () => {
  alertModal.classList.remove('hidden');
});

closeAlertBtn.addEventListener('click', () => {
  alertModal.classList.add('hidden');
});

saveAlertBtn.addEventListener('click', async () => {
  const name = document.getElementById('alert-name').value;
  const city = document.getElementById('alert-city').value;
  const threshold = parseFloat(document.getElementById('alert-threshold').value);

  // POST /api/alerts
  const resp = await fetch(apiBase + '/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.localStorage.getItem(authTokenKey) || ''}` },
    body: JSON.stringify({ name, city, threshold })
  }).then(r => r.json()).catch(() => null);

  alertModal.classList.add('hidden');

  // show notification (demo)
  const n = document.createElement('div');
  n.textContent = `${name} created for ${city} threshold ${threshold}`;
  notifContainer.appendChild(n);
});

(async function init() {
  await loginDemo();
  // Optionally load persisted cities from backend (if any)
  const cities = await fetch(apiBase + '/users/demo-user/cities').then(r => r.json()).catch(() => []);
  if (Array.isArray(cities)) {
    cities.forEach(c => {
      const card = createCityCard(c.name, c.temp ? `${c.temp}°C` : '-');
      cardsContainer.appendChild(card);
    });
  }
})();