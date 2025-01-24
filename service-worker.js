self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('stoppuhr-cache-v1').then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './styles.css',
                './app.js',
                './manifest.json',
                './icon-128x128.png',
                './icon-512x512.png',
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
