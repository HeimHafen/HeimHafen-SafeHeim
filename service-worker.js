// /service-worker.js
const CACHE = 'sh-v1';
const ASSETS = [
'./', './index.html',
'./assets/app.css', './assets/app.js',
'./assets/logo.svg',
'./assets/icon-shield-180.png',
'./assets/icon-shield-192.png',
'./assets/icon-shield-512.png',
'./arrived.html', './panic.html', './qr-scan.html', './ride/'
];

self.addEventListener('install', e => {
e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
self.skipWaiting();
});

self.addEventListener('activate', e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

// HTML: network-first, Assets: cache-first
self.addEventListener('fetch', e => {
const req = e.request;
const isHTML = req.headers.get('accept')?.includes('text/html');
if (isHTML) {
e.respondWith(
fetch(req).then(r => {
const clone = r.clone();
caches.open(CACHE).then(c => c.put(req, clone));
return r;
}).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
);
} else {
e.respondWith(
caches.match(req).then(r => r || fetch(req).then(r2 => {
const clone = r2.clone();
caches.open(CACHE).then(c => c.put(req, clone));
return r2;
}))
);
}
});
