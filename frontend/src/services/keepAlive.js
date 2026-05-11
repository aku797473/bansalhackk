/**
 * keepAlive.js
 * Pings Render microservices on load and every 10 min to prevent 502 cold-starts.
 * Render free tier sleeps after 15 min of inactivity.
 */

const BASE = import.meta.env.VITE_API_BASE_URL ||
             import.meta.env.VITE_API_GATEWAY_URL ||
             '/api';

// Only ping public (no-auth) GET endpoints — auth-required routes return 401 but are already awake
const PING_URLS = [
  `${BASE}/weather/current?lat=24.6005&lon=80.8322`,
  `${BASE}/market/commodities`,
  `${BASE}/schemes`,
];

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function pingAll() {
  PING_URLS.forEach(url => {
    fetch(url, { method: 'GET', credentials: 'omit', mode: 'no-cors' })
      .catch(() => {}); // silently ignore — just waking the service up
  });
}

export function startKeepAlive() {
  // Render cold start takes 30-60s — ping immediately then retry
  pingAll();                                         // 0s  — initial wake
  setTimeout(pingAll, 15_000);                      // 15s — retry
  setTimeout(pingAll, 40_000);                      // 40s — final retry
  setInterval(pingAll, INTERVAL_MS);                // every 10 min after that
}

