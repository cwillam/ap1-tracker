const CACHE_NAME = "ap1-tracker-v3.0.4";
const ASSETS = [
	"index.html",
	"subnet.html",
	"sql.html",
	"pseudocode.html",
	"glossar.html",
	"updates.html",
	"help.html",
	"bildungseinrichtungen.html",
	"datenschutz.html",
	"impressum.html",
	"favicon.svg",
	"manifest.json",
	"icon-192.png",
	"icon-512.png",
	"assets/css/style.css?v=3.0.0",
	"assets/js/tailwind.js?v=3.0.0",
	"assets/js/lucide.min.js?v=3.0.0",
	"assets/js/confetti.js?v=3.0.0",
	"assets/js/data.js?v=3.0.0",
	"assets/js/questions.js?v=3.0.4",
	"assets/js/app.js?v=3.0.0",
	"assets/js/subnet.js?v=3.0.0",
	"assets/js/sql.js?v=3.0.0",
	"assets/js/pseudocode.js?v=3.0.0",
	"assets/fonts/Inter-Regular.woff2",
	"assets/fonts/Inter-SemiBold.woff2",
	"assets/fonts/Inter-Bold.woff2",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(ASSETS);
		}),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.map((key) => {
					if (key !== CACHE_NAME) {
						return caches.delete(key);
					}
				}),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	// Nur GET-Anfragen cachen
	if (event.request.method !== "GET") return;

	// HTML-Navigationen: Network-First (Offline-Fallback auf Cache)
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request)
				.then((networkResponse) => {
					if (networkResponse.status === 200) {
						const clone = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
					}
					return networkResponse;
				})
				.catch(() => caches.match(event.request)),
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				// Im Hintergrund nach Aktualisierung suchen (Stale-While-Revalidate)
				fetch(event.request)
					.then((networkResponse) => {
						if (networkResponse.status === 200) {
							caches.open(CACHE_NAME).then((cache) => {
								cache.put(event.request, networkResponse);
							});
						}
					})
					.catch(() => {
						/* Netzwerkfehler im Hintergrund ignorieren */
					});

				return cachedResponse;
			}

			return fetch(event.request).then((networkResponse) => {
				if (networkResponse.status === 200) {
					const responseClone = networkResponse.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseClone);
					});
				}
				return networkResponse;
			});
		}),
	);
});
