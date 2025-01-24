const CACHE_NAME = 'stoppuhr-pwa-v2';
const ASSETS_TO_CACHE = [
  '/stoppuhr-pwa/',
  '/stoppuhr-pwa/index.html',
  '/stoppuhr-pwa/styles.css',
  '/stoppuhr-pwa/app.js',
  '/stoppuhr-pwa/manifest.json',
  '/stoppuhr-pwa/icons/icon-128x128.png',
  '/stoppuhr-pwa/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
