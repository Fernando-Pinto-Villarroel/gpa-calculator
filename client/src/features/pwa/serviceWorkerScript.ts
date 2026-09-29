import { routing } from "@/core/lib/i18n/routing";

export const OFFLINE_ROUTES = ["", "/grades", "/grades/playground", "/statistics", "/forecast", "/about"];

export const OFFLINE_ASSETS = [
  "/logo.png",
  "/logo192.png",
  "/logo512.png",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/pdf.worker.min.mjs",
];

export const CACHE_PREFIX = "jala-gpa-";

export function buildServiceWorkerScript(version: string): string {
  const config = {
    cacheName: `${CACHE_PREFIX}${version}`,
    cachePrefix: CACHE_PREFIX,
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    routes: OFFLINE_ROUTES,
    assets: OFFLINE_ASSETS,
  };

  return `const CONFIG = ${JSON.stringify(config)};
const PAGES = CONFIG.locales.flatMap((locale) => CONFIG.routes.map((route) => "/" + locale + route));
const STATIC_REFERENCE = /\\/_next\\/static\\/[^"'\\s)\\\\]+/g;

async function openCache() {
  try {
    return await caches.open(CONFIG.cacheName);
  } catch (error) {
    return null;
  }
}

async function matchCache(cache, key) {
  if (!cache) return undefined;
  try {
    return await cache.match(key);
  } catch (error) {
    return undefined;
  }
}

async function putIfOk(cache, key, response) {
  if (!cache || !response || !response.ok || response.type !== "basic") return;
  try {
    await cache.put(key, response);
  } catch (error) {
    return;
  }
}

async function cacheStaticReferences(cache, text) {
  const references = Array.from(new Set(text.match(STATIC_REFERENCE) || []));
  await Promise.allSettled(
    references.map(async (reference) => {
      if (await matchCache(cache, reference)) return;
      const response = await fetch(reference);
      if (reference.endsWith(".css") && response.ok) {
        await cacheStaticReferences(cache, await response.clone().text());
      }
      await putIfOk(cache, reference, response);
    }),
  );
}

async function precachePage(cache, path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok || response.redirected) return;
  await cacheStaticReferences(cache, await response.clone().text());
  await putIfOk(cache, path, response);
}

function fallbackPath(url) {
  const segment = url.pathname.split("/")[1];
  if (CONFIG.locales.includes(segment)) return "/" + segment;
  const language = ((self.navigator && self.navigator.language) || "").toLowerCase();
  const locale = CONFIG.locales.find((candidate) => language.startsWith(candidate)) || CONFIG.defaultLocale;
  return "/" + locale;
}

async function networkFirstPage(request, url) {
  let response;
  try {
    response = await fetch(request);
  } catch (error) {
    const cache = await openCache();
    return (
      (await matchCache(cache, url.pathname)) ||
      (await matchCache(cache, fallbackPath(url))) ||
      Response.error()
    );
  }
  if (response.ok && response.type === "basic" && !response.redirected) {
    await putIfOk(await openCache(), url.pathname, response.clone());
  }
  return response;
}

async function cacheFirst(request, url) {
  const cache = await openCache();
  const cached = await matchCache(cache, url.pathname);
  if (cached) return cached;
  const response = await fetch(request);
  await putIfOk(cache, url.pathname, response.clone());
  return response;
}

async function staleWhileRevalidate(request, url) {
  const cache = await openCache();
  const cached = await matchCache(cache, url.pathname);
  const refresh = fetch(request)
    .then(async (response) => {
      await putIfOk(cache, url.pathname, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await refresh) || fetch(request);
}

function respondSafely(event, handler) {
  const request = event.request;
  event.respondWith(handler().catch(() => fetch(request)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await openCache();
        if (cache) {
          await Promise.allSettled(
            CONFIG.assets.map(async (asset) => putIfOk(cache, asset, await fetch(asset))),
          );
          await Promise.allSettled(PAGES.map((page) => precachePage(cache, page)));
        }
      } catch (error) {
        return;
      } finally {
        await self.skipWaiting();
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const names = await caches.keys();
        await Promise.allSettled(
          names
            .filter((name) => name.startsWith(CONFIG.cachePrefix) && name !== CONFIG.cacheName)
            .map((name) => caches.delete(name)),
        );
      } catch (error) {
        return;
      } finally {
        await self.clients.claim();
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    respondSafely(event, () => networkFirstPage(request, url));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    respondSafely(event, () => cacheFirst(request, url));
    return;
  }
  if (CONFIG.assets.includes(url.pathname)) {
    respondSafely(event, () => staleWhileRevalidate(request, url));
  }
});
`;
}
