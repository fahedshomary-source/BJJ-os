const CACHE = 'bjjos-v2';
const BASE = '/BJJ-os';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => {
      if (r) return r;
      return fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(BASE + '/index.html'));
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'BJJ OS', body: 'Check your schedule.' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'BJJ OS', {
      body: data.body,
      icon: BASE + '/icon-192.png',
      badge: BASE + '/icon-192.png',
      tag: data.tag || 'bjjos',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(BASE + '/'));
});
