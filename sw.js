const CACHE_NAME = 'quran-app-v1';

const ASSETS_TO_CACHE = [
  '/quran/',
  '/quran/index.html',
  '/quran/site.webmanifest.json',
  '/quran/assets/css/style.css',
  '/quran/assets/js/script.js',
  '/quran/data/quran.txt',
  '/quran/data/en.hilali.txt',
  '/quran/assets/icons/icon-192.png',
  '/quran/assets/icons/icon-512.png'
];

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        await cache.addAll(ASSETS_TO_CACHE);
      } catch (err) {
        console.warn('❌ Failed to cache some files', err);
      }
    })
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

// Fetch: try cache first, then network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
