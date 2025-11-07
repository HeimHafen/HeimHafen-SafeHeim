// Scope: ganze Projektseite
const BASE = '/HeimHafen-SafeHeim/';
const CACHE = 'safeheim-v2';

const A = p => BASE + p;
const ASSETS = [
  '', 'index.html',
  'arrived.html', 'panic.html', 'ride/index.html',
  'assets/app.css', 'assets/app.js', 'assets/logo.svg',
  'assets/icon-shield-192.png', 'assets/icon-shield-512.png'
].map(A);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(A('index.html'))))
  );
});