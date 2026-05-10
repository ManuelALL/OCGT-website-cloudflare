/**
 * OCGT Service Worker — SELF-DESTRUCT MODE.
 *
 * The earlier SW (v1) had a bug: on cache miss it fell back to `/` (home page),
 * causing every refresh on a deep route to misroute to the home page. To fix
 * this for already-affected users without making them manually unregister in
 * DevTools, this build of sw.js immediately unregisters itself and wipes every
 * cache it created. After it runs once, the next page load is plain network —
 * no SW intercepts. Fast, correct, and reversible.
 *
 * If we want to re-introduce a service worker later, we can ship a fresh one
 * with a different scope or a versioned filename, and bump CACHE_VERSION.
 */

self.addEventListener('install', (event) => {
  // Skip waiting so this version takes control immediately on next request.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. Wipe every cache this origin has ever created.
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_) {}

    // 2. Take over all open tabs immediately so the unregistration applies now.
    try { await self.clients.claim(); } catch (_) {}

    // 3. Unregister this SW so future fetches go straight to the network.
    try { await self.registration.unregister(); } catch (_) {}

    // 4. Force a soft-reload of every controlled tab so the user immediately
    //    sees the correct content (the page they're actually on, not the
    //    cached home page the old SW would have served).
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url).catch(() => {}));
    } catch (_) {}
  })());
});

// Don't intercept any fetches — let the browser go directly to the network.
// (No 'fetch' listener intentionally.)
