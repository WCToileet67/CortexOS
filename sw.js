// ============================================================
// sw.js – Service Worker dla CortexOS
// ============================================================

const CACHE_NAME = 'cortexos-v1';
const urlsToCache = [
    '/CortexOS/',
    '/CortexOS/index.html',
    '/CortexOS/style.css',
    '/CortexOS/main.js',
    '/CortexOS/manifest.json',
    '/CortexOS/brain-brainstorm-creative-svgrepo-com.svg'
];

// Instalacja – zapisuje pliki w cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Aktywacja – usuwa stare cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Obsługa zapytań – najpierw cache, potem sieć
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
