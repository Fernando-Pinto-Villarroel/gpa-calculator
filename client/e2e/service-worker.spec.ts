import vm from "vm";
import { test, expect } from "@playwright/test";
import { buildServiceWorkerScript } from "../src/features/pwa/serviceWorkerScript";

type Handler = (event: FakeEvent) => void;

interface FakeEvent {
  request?: { method: string; url: string; mode: string };
  respondWith?: (response: Promise<Response>) => void;
  waitUntil?: (promise: Promise<unknown>) => void;
}

interface Failures {
  open?: boolean;
  put?: boolean;
  match?: boolean;
}

class FakeCache {
  entries = new Map<string, Response>();
  constructor(
    private origin: string,
    private failures: Failures = {},
  ) {}
  private key(request: string) {
    return new URL(request, this.origin).pathname;
  }
  async match(request: string) {
    if (this.failures.match) throw new Error("match failed");
    const hit = this.entries.get(this.key(request));
    return hit ? hit.clone() : undefined;
  }
  async put(request: string, response: Response) {
    if (this.failures.put) throw new DOMException("Quota exceeded", "QuotaExceededError");
    this.entries.set(this.key(request), response);
  }
}

class FakeCacheStorage {
  stores = new Map<string, FakeCache>();
  constructor(
    private origin: string,
    private failures: Failures = {},
  ) {}
  async open(name: string) {
    if (this.failures.open) throw new Error("storage unavailable");
    if (!this.stores.has(name)) this.stores.set(name, new FakeCache(this.origin, this.failures));
    return this.stores.get(name)!;
  }
  async keys() {
    return [...this.stores.keys()];
  }
  async delete(name: string) {
    return this.stores.delete(name);
  }
}

function page(html: string, url: string): Response {
  const response = new Response(html, { status: 200, headers: { "Content-Type": "text/html" } });
  Object.defineProperty(response, "type", { value: "basic" });
  Object.defineProperty(response, "url", { value: url });
  Object.defineProperty(response, "clone", { value: () => page(html, url) });
  return response;
}

interface WorkerOptions {
  version: string;
  origin?: string;
  online?: boolean;
  pages?: Record<string, string>;
  existingCaches?: string[];
  failures?: Failures;
}

function loadWorker({
  version,
  origin = "https://any-host.example",
  online = true,
  pages = {},
  existingCaches = [],
  failures = {},
}: WorkerOptions) {
  const handlers: Record<string, Handler> = {};
  const caches = new FakeCacheStorage(origin, failures);
  existingCaches.forEach((name) => caches.stores.set(name, new FakeCache(origin)));
  const fetched: string[] = [];
  const state = { online };

  const fetchImpl = async (input: string | { url: string }) => {
    const url = new URL(typeof input === "string" ? input : input.url, origin);
    fetched.push(url.pathname + url.search);
    if (!state.online) throw new TypeError("Failed to fetch");
    const body = pages[url.pathname] ?? `content of ${url.pathname}`;
    return page(body, url.href);
  };

  const sandbox = {
    self: {
      location: { origin },
      navigator: { language: "es-BO" },
      addEventListener: (type: string, handler: Handler) => {
        handlers[type] = handler;
      },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches,
    fetch: fetchImpl,
    Response,
    URL,
    Promise,
    Array,
    Set,
  };
  vm.runInNewContext(buildServiceWorkerScript(version), sandbox);

  async function run(type: string, init: Partial<FakeEvent> = {}) {
    let waited: Promise<unknown> = Promise.resolve();
    let responded: Promise<Response> | null = null;
    handlers[type]({
      ...init,
      waitUntil: (p) => {
        waited = p;
      },
      respondWith: (r) => {
        responded = r;
      },
    });
    await waited;
    return responded as Promise<Response> | null;
  }

  function request(path: string, mode = "cors") {
    return { method: "GET", url: new URL(path, origin).href, mode };
  }

  return { caches, fetched, state, run, request, origin };
}

test.describe("Offline service worker", () => {
  test("installing precaches every page in every language plus the assets they reference", async () => {
    const worker = loadWorker({
      version: "build-1",
      pages: {
        "/en": '<script src="/_next/static/chunks/app.js"></script><link rel="stylesheet" href="/_next/static/chunks/app.css">',
        "/_next/static/chunks/app.css": "@font-face{src:url(/_next/static/media/font.woff2)}",
      },
    });
    await worker.run("install");

    const cache = worker.caches.stores.get("jala-gpa-build-1")!;
    for (const locale of ["en", "es", "pt"]) {
      for (const route of ["", "/grades", "/grades/playground", "/statistics", "/forecast", "/about"]) {
        expect(cache.entries.has(`/${locale}${route}`)).toBe(true);
      }
    }
    expect(cache.entries.has("/_next/static/chunks/app.js")).toBe(true);
    expect(cache.entries.has("/_next/static/chunks/app.css")).toBe(true);
    expect(cache.entries.has("/_next/static/media/font.woff2")).toBe(true);
    expect(cache.entries.has("/pdf.worker.min.mjs")).toBe(true);
  });

  test("activating a new version deletes older app caches and keeps unrelated ones", async () => {
    const worker = loadWorker({
      version: "build-2",
      existingCaches: ["jala-gpa-build-1", "jala-gpa-v4", "some-other-app"],
    });
    await worker.run("install");
    await worker.run("activate");
    expect(await worker.caches.keys()).toEqual(["some-other-app", "jala-gpa-build-2"]);
  });

  test("online, a page always comes from the network and refreshes the cached copy", async () => {
    const pages: Record<string, string> = { "/en/about": "old release" };
    const worker = loadWorker({ version: "build-1", pages });
    await worker.run("install");

    pages["/en/about"] = "new release";
    const response = await worker.run("fetch", { request: worker.request("/en/about", "navigate") });
    expect(await response!.text()).toBe("new release");

    const cache = worker.caches.stores.get("jala-gpa-build-1")!;
    expect(await (await cache.match("/en/about"))!.text()).toBe("new release");

    worker.state.online = false;
    const offline = await worker.run("fetch", { request: worker.request("/en/about", "navigate") });
    expect(await offline!.text()).toBe("new release");
  });

  test("offline, a visited or precached page is served from the cache", async () => {
    const worker = loadWorker({ version: "build-1", pages: { "/pt/forecast": "cached forecast" } });
    await worker.run("install");
    worker.state.online = false;

    const response = await worker.run("fetch", { request: worker.request("/pt/forecast", "navigate") });
    expect(await response!.text()).toBe("cached forecast");
  });

  test("offline, an unknown path falls back to the home page of its language", async () => {
    const worker = loadWorker({ version: "build-1", pages: { "/es": "inicio" } });
    await worker.run("install");
    worker.state.online = false;

    const response = await worker.run("fetch", { request: worker.request("/es/does-not-exist", "navigate") });
    expect(await response!.text()).toBe("inicio");
  });

  test("offline, the bare root falls back to the device language's home page", async () => {
    const worker = loadWorker({ version: "build-1", pages: { "/es": "inicio" } });
    await worker.run("install");
    worker.state.online = false;

    const response = await worker.run("fetch", { request: worker.request("/", "navigate") });
    expect(await response!.text()).toBe("inicio");
  });

  test("hashed build files are served from the cache once stored", async () => {
    const worker = loadWorker({ version: "build-1", pages: { "/en": '<script src="/_next/static/chunks/a.js"></script>' } });
    await worker.run("install");
    worker.fetched.length = 0;

    const response = await worker.run("fetch", { request: worker.request("/_next/static/chunks/a.js") });
    expect(response).not.toBeNull();
    await response;
    expect(worker.fetched).not.toContain("/_next/static/chunks/a.js");
  });

  test("page data requests, API calls and other origins are left to the network", async () => {
    const worker = loadWorker({ version: "build-1" });
    expect(await worker.run("fetch", { request: worker.request("/en/grades?_rsc=abc") })).toBeNull();
    expect(
      await worker.run("fetch", { request: { method: "GET", url: "https://fonts.example.com/a.woff2", mode: "cors" } }),
    ).toBeNull();
    expect(
      await worker.run("fetch", { request: { method: "POST", url: `${worker.origin}/en`, mode: "cors" } }),
    ).toBeNull();
  });

  test("the script is not tied to any domain and embeds the build version", async () => {
    const script = buildServiceWorkerScript("abc123");
    expect(script).toContain('"cacheName":"jala-gpa-abc123"');
    expect(script).not.toMatch(/https?:\/\//);
    expect(script).not.toContain("vercel");

    const other = loadWorker({ version: "build-1", origin: "https://another-domain.example" });
    await other.run("install");
    expect(other.fetched.every((path) => path.startsWith("/"))).toBe(true);
  });

  test("when the cache cannot be opened at all, install still succeeds and every request goes to the network", async () => {
    const worker = loadWorker({ version: "build-1", failures: { open: true }, pages: { "/en": "live page" } });
    await worker.run("install");
    await worker.run("activate");

    const pageResponse = await worker.run("fetch", { request: worker.request("/en", "navigate") });
    expect(await pageResponse!.text()).toBe("live page");
    const chunk = await worker.run("fetch", { request: worker.request("/_next/static/chunks/x.js") });
    expect(chunk!.ok).toBe(true);
  });

  test("when storage is full, pages and files are still served from the network", async () => {
    const worker = loadWorker({ version: "build-1", failures: { put: true }, pages: { "/es/grades": "notas" } });
    await worker.run("install");

    const pageResponse = await worker.run("fetch", { request: worker.request("/es/grades", "navigate") });
    expect(await pageResponse!.text()).toBe("notas");
    const asset = await worker.run("fetch", { request: worker.request("/logo192.png") });
    expect(asset!.ok).toBe(true);
  });

  test("when reading the cache throws, the request falls back to the network", async () => {
    const worker = loadWorker({ version: "build-1", failures: { match: true }, pages: { "/pt": "inicio" } });
    await worker.run("install");

    const chunk = await worker.run("fetch", { request: worker.request("/_next/static/chunks/y.js") });
    expect(chunk!.ok).toBe(true);
    const pageResponse = await worker.run("fetch", { request: worker.request("/pt", "navigate") });
    expect(await pageResponse!.text()).toBe("inicio");
  });
});
