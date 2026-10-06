// Minimal service worker: makes the app installable and loads fast.
// - Pages (navigation): network first, fall back to the cached shell when offline.
// - Same-origin static files (JS/CSS/icons): cache first, refreshed in the background.
// - API calls (other origin, e.g. your Render backend) are NEVER cached.
//
// v2: the cache name changed so any wrong files saved by v1 are deleted, and we
// never store an HTML page as a static asset (a missing file on Vercel returns the
// app's index.html with status 200, which must not be cached as an icon/JS/CSS).
const CACHE = "custom-ai-v2";

const isHtml = (res) => (res.headers.get("content-type") || "").includes("text/html");

self.addEventListener("install", (event) => {
  // Only pre-cache the app shell page itself.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  // Page loads: always try the network so new deployments show up immediately.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/").then((res) => res || Response.error()))
    );
    return;
  }

  // Static assets: serve from cache, update in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok && !isHtml(res)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});