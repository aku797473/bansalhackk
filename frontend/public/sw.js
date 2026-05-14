const CACHE_NAME = 'smart-kisan-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/logo.png',
  '/manifest.json'
];


// Install Event - Caching basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Cleaning up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Strategic caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Only cache GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (like Clerk or Gemini API)
  // unless they are for images/fonts
  if (!request.url.startsWith(self.location.origin) && 
      !request.url.includes('fonts.googleapis.com') &&
      !request.url.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version but fetch update in background (Stale-While-Revalidate)
        if (navigator.onLine) {
          fetch(request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }).catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        // Cache dynamic assets (JS chunks, CSS, etc.)
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Offline Fallback for Page navigation
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Return a basic error response to satisfy the fetch handler
        return new Response('Network Error', { status: 404, statusText: 'Not Found' });
      });
    })
  );
});
