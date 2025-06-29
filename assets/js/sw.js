const CACHE_NAME = 'quran-app-v1';
const OFFLINE_URL = '/offline.html'; // Optional fallback page

const ASSETS_TO_CACHE = [
  '/quran/',
  '/quran/index.html',
  '/quran/manifest.json',
  '/quran/assets/css/style.css',
  '/quran/assets/js/script.js',
  '/quran/data/quran.txt',
  '/quran/data/en.hilali.txt',
  '/quran/assets/icons/icon-192.png',
  '/quran/assets/icons/icon-512.png',
  '/quran/offline.html'
];

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: try cache first, then network, then offline fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
