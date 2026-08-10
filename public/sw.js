// Trackstack — no service worker needed. This uninstalls old ones.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => {
  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  self.registration.unregister()
})
