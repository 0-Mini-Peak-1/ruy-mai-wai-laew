/* ไทยช่วยไทย — offline service worker (production only) */

const CACHE = "thai-chuay-thai-v1";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/icon-32.png",
  "/icon-180.png",
  "/icon-192.png",
  "/icon-512.png",
];

async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => null)));

  // Cache the hashed Next.js bundles referenced by the app shell so the very
  // first offline reload works, not just the second visit.
  try {
    const response = await fetch("/", { cache: "no-store" });
    if (!response.ok) return;
    const html = await response.clone().text();
    await cache.put("/", response);

    const urls = new Set();
    const regex = /(?:src|href)="(\/_next\/static\/[^"?#]+)"/g;
    let match;
    while ((match = regex.exec(html))) urls.add(match[1]);
    await Promise.all([...urls].map((url) => cache.add(url).catch(() => null)));
  } catch {
    // Offline install — keep whatever the app shell gave us.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigations: network-first, fall back to the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match("/");
        })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js");

  if (!isStatic) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
