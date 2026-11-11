/* Service worker: cache-first for same-origin GETs, runtime caching for the rest.
 * Lets the course work offline once loaded (iOS "Add to Home Screen" supported). */
const CACHE = "lean-course-v3";
const PRECACHE = [
  "./",
  "./index.html",
  "./write.html",
  "./gate.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/site.js",
  "./assets/quiz.js",
  "./assets/handwriting.js",
  "./assets/gate.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  // Navigations (HTML pages): network-first, so a new deploy (e.g. the access
  // gate) is picked up on the next reload; fall back to cache when offline.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return resp;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }
  // Static assets: cache-first, runtime-cached.
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((resp) => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return resp;
      });
    })
  );
});
