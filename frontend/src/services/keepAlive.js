/**
 * keepAlive.js
 * Hits the public /api/wake endpoint which internally pings ALL services.
 * No auth required — gateway handles forwarding to each microservice.
 * Render free tier sleeps after 15 min; this prevents cold-start 502s.
 */

const GATEWAY = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_GATEWAY_URL ||
  'https://smart-kisan-gateway.onrender.com'
).replace('/api', ''); // need root URL, not /api prefix

const WAKE_URL = `${GATEWAY}/api/wake`;

function pingWake() {
  fetch(WAKE_URL, { method: 'GET', mode: 'cors' })
    .then(r => r.json())
    .then(data => {
      const alive = data.services?.filter(s => s.status === 200).length || 0;
      console.log(`[KeepAlive] ${alive}/${data.services?.length || '?'} services warm`);
    })
    .catch(() => {}); // silently ignore
}

export function startKeepAlive() {
  pingWake();                              // 0s   — wake immediately on load
  setTimeout(pingWake, 20_000);           // 20s  — retry
  setTimeout(pingWake, 50_000);           // 50s  — final retry
  setInterval(pingWake, 9 * 60 * 1000);  // every 9 min — keep all services warm
}
