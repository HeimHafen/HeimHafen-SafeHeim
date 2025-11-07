// Simple offline cache (static assets + key pages)
const CACHE = 'safeheim-v1';
const ASSETS = [
  '/', '/index.html',
  '/arrived.html', '/panic.html', '/ride/index.html',
  '/assets/app.css', '/assets/app.js', '/assets/logo.svg',
  '/assets/icon-shield-192.png', '/assets/icon-shield-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(r=>{
      const copy = r.clone();
      caches.open(CACHE).then(c=>c.put(req, copy));
      return r;
    }).catch(()=>caches.match('/index.html')))
  );
});