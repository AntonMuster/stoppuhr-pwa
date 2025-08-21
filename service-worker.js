const CACHE_NAME = 'stoppuhr-cache-v2';
const CACHE_VERSION = 2;
const STATIC_CACHE_NAME = `stoppuhr-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `stoppuhr-dynamic-v${CACHE_VERSION}`;

const STATIC_FILES = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-128x128.png',
    './icon-512x512.png'
];

// Install Event - Cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(STATIC_CACHE_NAME);
                console.log('Service Worker: Caching static files');
                await cache.addAll(STATIC_FILES);
                console.log('Service Worker: Static files cached successfully');
                
                // Skip waiting to activate immediately
                await self.skipWaiting();
            } catch (error) {
                console.error('Service Worker: Install failed', error);
                throw error;
            }
        })()
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();
                const deletePromises = cacheNames
                    .filter(cacheName => {
                        // Delete old versions of our caches
                        return (cacheName.startsWith('stoppuhr-') && 
                               cacheName !== STATIC_CACHE_NAME && 
                               cacheName !== DYNAMIC_CACHE_NAME);
                    })
                    .map(cacheName => {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    });
                
                await Promise.all(deletePromises);
                console.log('Service Worker: Old caches cleaned up');
                
                // Claim all clients immediately
                await self.clients.claim();
                console.log('Service Worker: Clients claimed');
            } catch (error) {
                console.error('Service Worker: Activation failed', error);
            }
        })()
    );
});

// Fetch Event - Serve from cache with network fallback
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        (async () => {
            try {
                // Try cache first
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }
                
                // Network fallback
                console.log('Service Worker: Fetching from network', event.request.url);
                const networkResponse = await fetch(event.request);
                
                // Cache successful responses
                if (networkResponse.status === 200) {
                    const cache = await caches.open(DYNAMIC_CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
                    console.log('Service Worker: Cached network response', event.request.url);
                }
                
                return networkResponse;
                
            } catch (error) {
                console.error('Service Worker: Fetch failed', error);
                
                // Return offline fallback for HTML requests
                if (event.request.headers.get('accept')?.includes('text/html')) {
                    const offlineResponse = await caches.match('./index.html');
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                }
                
                // Return a basic offline response
                return new Response('Offline - Bitte überprüfen Sie Ihre Internetverbindung', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
                });
            }
        })()
    );
});

// Message Event - Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION_INFO',
            version: CACHE_VERSION,
            cacheName: STATIC_CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        (async () => {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    success: true
                });
            } catch (error) {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED',
                    success: false,
                    error: error.message
                });
            }
        })();
    }
});

// Background Sync (if supported)
if ('sync' in self.registration) {
    self.addEventListener('sync', (event) => {
        console.log('Service Worker: Background sync triggered', event.tag);
        
        if (event.tag === 'background-sync') {
            event.waitUntil(
                // Perform background tasks here
                console.log('Service Worker: Performing background sync')
            );
        }
    });
}

// Push notifications (if needed in future)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push message received');
    
    const options = {
        body: event.data ? event.data.text() : 'Stoppuhr Benachrichtigung',
        icon: './icon-128x128.png',
        badge: './icon-128x128.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('Stoppuhr PWA', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        self.clients.openWindow('./')
    );
});

// Error handler
self.addEventListener('error', (event) => {
    console.error('Service Worker: Global error', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
    event.preventDefault();
});
