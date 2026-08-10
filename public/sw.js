// Trackstack service worker — auto-updates on new builds
const CACHE = 'trackstack-v2'

self.addEventListener('install', e => {
  // Skip waiting — activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  // Clear ALL old caches, then take control
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE) return caches.delete(k)
    }))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Network-first: try to fetch fresh, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful responses
        const clone = response.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return response
      })
      .catch(() => caches.match(e.request))
  )
})
