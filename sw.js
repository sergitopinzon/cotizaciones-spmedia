const CACHE = 'cot-spmedia-v14';
const ASSETS = ['./', './index.html', './sp_media_logo.png', './icon-192.png', './icon-512.png', './manifest.json', './firma.png?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // No tocar peticiones a Supabase ni nada de otro origen; solo GET del mismo sitio
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // La app (HTML): red primero para no quedar desactualizada; recae al caché sin internet
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // Recursos estáticos: caché primero
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
