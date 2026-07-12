const CACHE_NAME = 'ap1-tracker-v2.3.1';
const ASSETS = [
  'index.html',
  'updates.html',
  'help.html',
  'favicon.svg',
  'manifest.json',
  'assets/css/style.css?v=2.3.1',
  'assets/js/tailwind.js?v=2.3.1',
  'assets/js/lucide.min.js?v=2.3.1',
  'assets/js/confetti.js?v=2.3.1',
  'assets/js/data.js?v=2.3.1',
  'assets/js/questions.js?v=2.3.1',
  'assets/js/app.js?v=2.3.1'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Nur GET-Anfragen cachen
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Im Hintergrund nach Aktualisierung suchen (Stale-While-Revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Netzwerkfehler im Hintergrund ignorieren */});
        
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    })
  );
});
