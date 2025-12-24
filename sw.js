
const CACHE_NAME = 'voula-pro-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Poppins:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('App Pronto para uso Offline');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Estratégia Stale-While-Revalidate para maior fluidez
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Atualiza cache dinamicamente apenas para recursos do próprio domínio ou assets estáticos
        if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('cdn')) {
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, networkResponse.clone());
           });
        }
        return networkResponse;
      }).catch(() => {
        // Em caso de falha total de rede e ausência de cache, retorna página inicial para navegação
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
      return cachedResponse || fetchPromise;
    })
  );
});
