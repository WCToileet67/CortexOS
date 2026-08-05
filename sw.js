const CACHE_NAME = 'cortexos-v1.2.0';
const APP_SHELL = [
    './',
    './index.html',
    './offline.html',
    './style.css',
    './config.json',
    './manifest.webmanifest',
    './brain-brainstorm-creative-svgrepo-com.svg',
    './main.js',
    './jadro/menuStart.js',
    './jadro/okna.js',
    './jadro/pasekZadan.js',
    './jadro/powiadomienia.js',
    './jadro/pulpit.js',
    './jadro/ustawieniaSystemowe.js',
    './motywy/jasny.css',
    './motywy/niebieski.css',
    './motywy/zielony.css',
    './aplikacje/arkusz.js',
    './aplikacje/eksplorator.js',
    './aplikacje/galeria.js',
    './aplikacje/gra.js',
    './aplikacje/kalendarz.js',
    './aplikacje/kalkulator.js',
    './aplikacje/muzyka.js',
    './aplikacje/notatnik.js',
    './aplikacje/pliki.js',
    './aplikacje/pogoda.js',
    './aplikacje/przypomnienia.js',
    './aplikacje/quiz.js',
    './aplikacje/rysunek.js',
    './aplikacje/snake.js',
    './aplikacje/terminal.js',
    './aplikacje/ustawienia.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    return response;
                })
                .catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('./offline.html');
                    }
                    return Response.error();
                });
        })
    );
});
