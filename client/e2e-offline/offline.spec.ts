import { test, expect, Page, BrowserContext } from "@playwright/test";

const PRECACHED_PAGES = ["en", "es", "pt"].flatMap((locale) =>
  ["", "/grades", "/grades/playground", "/statistics", "/forecast", "/about"].map((route) => `/${locale}${route}`),
);

async function seed(context: BrowserContext) {
  await context.addInitScript(() => {
    if (localStorage.getItem("jala-gpa-tour")) return;
    localStorage.setItem(
      "jala-gpa-tour",
      JSON.stringify({ state: { guidedTourCompleted: true, globalStepIndex: 0, whatsNewSeenVersion: "2.0.0" }, version: 0 }),
    );
  });
}

async function cachedPaths(page: Page): Promise<{ name: string; paths: string[] }[]> {
  return page.evaluate(async () => {
    const names = await caches.keys();
    return Promise.all(
      names.map(async (name) => {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        return { name, paths: requests.map((r) => new URL(r.url).pathname) };
      }),
    );
  });
}

async function waitForOfflineReady(page: Page) {
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, { timeout: 30_000 });
  await expect
    .poll(
      async () => {
        const stores = await cachedPaths(page);
        const paths = new Set(stores.flatMap((s) => s.paths));
        return PRECACHED_PAGES.every((p) => paths.has(p));
      },
      { timeout: 60_000 },
    )
    .toBe(true);
}

test.describe("Offline mode", () => {
  test("after the first visit, every page works without a connection, including ones never opened", async ({
    context,
    page,
  }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);

    await context.setOffline(true);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();

    await page.locator('nav a[href="/en/statistics"]').first().click();
    await expect(page).toHaveURL(/\/en\/statistics$/);
    await expect(page.getByText("Cumulative GPA Progression").first()).toBeVisible();

    await page.goto("/pt/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Sobre Esta Ferramenta" })).toBeVisible();

    await page.goto("/es/forecast", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Pronóstico de GPA").first()).toBeVisible();
  });

  test("grades entered offline are saved and shown on the dashboard", async ({ context, page }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);
    await context.setOffline(true);

    await page.goto("/en/grades", { waitUntil: "domcontentloaded" });
    const trigger = page.getByRole("button", { name: "—" }).first();
    await trigger.click();
    await trigger.locator("..").getByRole("button", { name: "A", exact: true }).click();

    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("4.00").first()).toBeVisible();
  });

  test("opening the site root offline lands on a cached home page", async ({ context, page }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);
    await context.setOffline(true);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
  });

  test("online, a newer deploy of a page is shown right away and replaces the offline copy", async ({
    context,
    page,
  }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);

    const original = await (await page.request.get("/en/about")).text();
    const newer = original.replace("About This Tool", "About This Tool NEW-RELEASE-MARKER");
    await context.route("**/en/about", (route) =>
      route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: newer }),
    );

    await page.goto("/en/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("NEW-RELEASE-MARKER").first()).toBeVisible();

    await context.unroute("**/en/about");
    await context.setOffline(true);
    await page.goto("/en/about", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("NEW-RELEASE-MARKER").first()).toBeVisible();
  });

  test("caches left by a previous release are deleted, so an old version is never served", async ({
    context,
    page,
  }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);
    const [current] = (await cachedPaths(page)).map((s) => s.name);

    await page.evaluate(async () => {
      const old = await caches.open("jala-gpa-previous-release");
      await old.put("/en", new Response("<h1>OLD RELEASE PAGE</h1>", { headers: { "Content-Type": "text/html" } }));
      await caches.open("jala-gpa-v4");
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.unregister();
    });

    await page.reload({ waitUntil: "networkidle" });
    await waitForOfflineReady(page);
    await expect.poll(async () => (await cachedPaths(page)).map((s) => s.name), { timeout: 30_000 }).toEqual([current]);

    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    await expect(page.getByText("OLD RELEASE PAGE")).toHaveCount(0);
  });

  test("the service worker script is never cached by the browser and carries the build version", async ({
    page,
  }) => {
    const response = await page.request.get("/sw.js");
    expect(response.headers()["cache-control"]).toContain("max-age=0");
    expect(response.headers()["content-type"]).toContain("javascript");
    expect(await response.text()).toMatch(/"cacheName":"jala-gpa-[^"]+"/);
  });
});

test.describe("Graceful handling", () => {
  test("a browser without service workers uses the app normally, with no errors", async ({ browser }) => {
    const context = await browser.newContext({ serviceWorkers: "block" });
    await seed(context);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    await page.locator('nav a[href="/en/grades"]').first().click();
    await expect(page).toHaveURL(/\/en\/grades$/);
    const trigger = page.getByRole("button", { name: "—" }).first();
    await trigger.click();
    await trigger.locator("..").getByRole("button", { name: "A", exact: true }).click();
    await page.locator('nav a[href="/en"]').first().click();
    await expect(page.getByText("4.00").first()).toBeVisible();

    expect(await page.evaluate(() => navigator.serviceWorker?.controller ?? null)).toBeNull();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("if an app file fails to load while online, the offline cache resets itself once and the page recovers", async ({
    context,
    page,
  }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);

    await page.evaluate(() => {
      (window as unknown as { beforeReset: boolean }).beforeReset = true;
      const script = document.createElement("script");
      script.src = "/_next/static/chunks/missing-file-for-test.js";
      document.head.appendChild(script);
    });

    await page.waitForFunction(() => !(window as unknown as { beforeReset?: boolean }).beforeReset, null, {
      timeout: 20_000,
    });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("jala-sw-reset"))).toBe("1");

    await waitForOfflineReady(page);

    await page.evaluate(() => {
      (window as unknown as { secondAttempt: boolean }).secondAttempt = true;
      const script = document.createElement("script");
      script.src = "/_next/static/chunks/missing-file-for-test.js";
      document.head.appendChild(script);
    });
    await page.waitForTimeout(3000);
    expect(await page.evaluate(() => (window as unknown as { secondAttempt?: boolean }).secondAttempt)).toBe(true);
  });

  test("a missing file while offline does not wipe the offline copy", async ({ context, page }) => {
    await seed(context);
    await page.goto("/en", { waitUntil: "networkidle" });
    await waitForOfflineReady(page);
    await context.setOffline(true);

    await page.evaluate(() => {
      const script = document.createElement("script");
      script.src = "/_next/static/chunks/missing-while-offline.js";
      document.head.appendChild(script);
    });
    await page.waitForTimeout(2000);

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("jala-sw-reset"))).toBeNull();
  });
});
