// Service Worker stub — the vite-plugin-pwa generates the real one at build time.
// This file is only used during development.

const CACHE_NAME = 'genealogy-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy during development
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

