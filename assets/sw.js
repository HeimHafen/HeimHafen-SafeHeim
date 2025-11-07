// Service Worker – Pro (sofort aktiv, Offline-Fallback, Navigation Preload)
const CACHE = 'safeheim-v19'; // <— bei jeder Änderung erhöhen
const ROOT = '/HeimHafen-SafeHeim/';
const OFFLINE_FALLBACK = ROOT + 'offline.html';

const ASSETS = [
ROOT, ROOT+'index.html',
ROOT+'arrived.html', ROOT+'panic.html', ROOT+'qr-scan.html',
ROOT+'help.html', ROOT+'datenschutz.html', ROOT+'impressum.html',
ROOT+'offline.html', ROOT+'ride/index.html', ROOT+'print/index.html', ROOT+'docs/onepager.html',
ROOT+'assets/app.css', ROOT+'assets/app.js', ROOT+'assets/qr/qr.js',
ROOT+'assets/logo.svg', ROOT+'assets/icon-shield-192.png', ROOT+'assets/icon-shield-512.png'
];

self.addEventListener('install', e=>{
self.skipWaiting();
e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('activate', e=>{
e.waitUntil((async ()=>{
if ('navigationPreload' in self.registration) { await self.registration.navigationPreload.enable(); }
const keys = await caches.keys();
await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
await self.clients.claim();
})());
});

function isSameOrigin(url){ return new URL(url).origin === self.location.origin; }
function isNavigation(req){ return req.mode === 'navigate'; }
function isAsset(req){ return isSameOrigin(req.url) && (/\.(css|js|svg|png|jpg|jpeg|webp|ico)$/i.test(req.url)); }

self.addEventListener('fetch', e=>{
const req = e.request;

if (isNavigation(req)) {
e.respondWith((async ()=>{
try{
const preload = await e.preloadResponse;
if (preload) return preload;
const net = await fetch(req);
if(net.ok) caches.open(CACHE).then(c=>c.put(req, net.clone()));
return net;
}catch(_){
const cached = await caches.match(req);
return cached || caches.match(OFFLINE_FALLBACK);
}
})());
return;
}

if (req.method==='GET' && isAsset(req)) {
e.respondWith((async ()=>{
const cached = await caches.match(req, {ignoreSearch:true});
if (cached) return cached;
try{
const net = await fetch(req);
if (net.ok) caches.open(CACHE).then(c=>c.put(req, net.clone()));
return net;
}catch(_){
return caches.match(OFFLINE_FALLBACK);
}
})());
}
});
