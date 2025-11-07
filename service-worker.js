/* SafeHeim Service Worker – Offline + Update UX */
const CACHE = 'sh-v3';
const PRECACHE = [
  './', './index.html', './offline.html',
  './assets/app.css', './assets/app.js', './assets/pwa.js', './assets/logo.svg',
  './assets/icon-shield-180.png', './assets/icon-shield-192.png', './assets/icon-shield-512.png',
  './arrived.html', './panic.html', './qr-scan.html', './ride/', './assets/qr.js'
];

// Instant install + pre-cache
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// Claim immediately & delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : undefined))))
  );
  self.clients.claim();
});

// Allow page to trigger skipWaiting()
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Strategy: HTML = network-first (+offline fallback), assets = cache-first (+runtime cache)
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const acceptsHTML = req.headers.get('accept')?.includes('text/html');

  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (acceptsHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./offline.html')))
    );
  } else {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
  }
});