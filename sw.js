// Deen Assist — Service Worker
// Bump this version any time you change cached files, so users get the update.
const CACHE_NAME = "deen-assist-cache-v6";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/app.js",
  "./js/auth.js",
  "./js/host-detect.js",
  "./js/firebase-config.js",
  "./js/quran.js",
  "./js/hadith.js",
  "./js/names.js",
  "./js/duas.js",
  "./js/zakat.js",
  "./js/hijri.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

// Install: pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for the chatbot/API calls, cache-first for app shell
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't try to cache cross-origin API/chatbot calls — just pass them through
  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Only cache successful responses — caching a 404/500 would
          // permanently stick a broken response in the cache until the
          // next version bump.
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match("./index.html")); // offline fallback
    })
  );
});
