import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { startKeepAlive } from './services/keepAlive';

// Wake up all Render microservices immediately + every 10 min
startKeepAlive();

// Handle Vite dynamic import (chunk load) failures gracefully by reloading
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('Failed to fetch dynamically imported module') || e.message.includes('Expected a JavaScript-or-Wasm module script'))) {
    console.warn('⚡ Chunk load error detected, triggering hard reload...', e);
    window.location.reload(true);
  }
}, true);

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && (e.reason.message.includes('Failed to fetch dynamically imported module') || e.reason.message.includes('Expected a JavaScript-or-Wasm module script'))) {
    console.warn('⚡ Unhandled chunk load promiss rejection, triggering hard reload...', e.reason);
    window.location.reload(true);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Service Worker registered:', reg.scope))
      .catch(err => console.log('[SW] Service Worker registration failed:', err));
  });
}
