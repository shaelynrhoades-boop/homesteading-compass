const CACHE_NAME = "homesteading-compass-web-v18";

const CACHE_URLS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/supabase-adapter.js",
  "/manifest.webmanifest",
  "/assets/hc-logo.png",
  "/assets/logo-barn.png",
  "/assets/icon-farm-stand.png",
  "/assets/icon-post-box.png",
  "/assets/icon-porch-light-map.png",
  "/support/",
  "/privacy-policy/",
  "/terms/",
  "/safety/",
  "/community-guidelines/",
  "/marketplace-rules/"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.map((name) => (name === CACHE_NAME ? null : caches.delete(name))))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
