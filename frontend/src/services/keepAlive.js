/**
 * keepAlive.js
 * Pings all Render microservices every 10 minutes to prevent cold-start 502s.
 * Render free tier spins down after 15 min of inactivity.
 */

const BASE = import.meta.env.VITE_API_BASE_URL ||
             import.meta.env.VITE_API_GATEWAY_URL ||
             '/api';

// Light GET endpoints — one per service, no side-effects
const PING_URLS = [
  `${BASE}/weather/current?lat=24.6&lon=80.8`,
  `${BASE}/market/commodities`,
  `${BASE}/labour/jobs?limit=1`,
  `${BASE}/schemes`,
  `${BASE}/auth/me`,
];

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function pingAll() {
  PING_URLS.forEach(url => {
    fetch(url, { method: 'GET', credentials: 'omit' })
      .catch(() => {}); // silently ignore — just waking the service up
  });
}

export function startKeepAlive() {
  // Ping immediately on app load (wakes sleeping services right away)
  setTimeout(pingAll, 3000); // 3s delay so app renders first
  // Then ping every 10 minutes
  setInterval(pingAll, INTERVAL_MS);
}
