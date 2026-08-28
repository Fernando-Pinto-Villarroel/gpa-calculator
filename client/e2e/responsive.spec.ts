import { test, expect } from "@playwright/test";
import {
  seedProfile,
  gotoDashboard,
  gotoGrades,
  gotoPlayground,
  gotoStatistics,
  gotoForecast,
} from "./fixtures";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 900 },
];

async function hasHorizontalOverflow(page: import("@playwright/test").Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
}

test.describe("Responsive layout - no horizontal overflow", () => {
  for (const viewport of VIEWPORTS) {
    test(`dashboard at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page);
      await page.setViewportSize(viewport);
      await gotoDashboard(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`Commercial SE grades at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page);
      await page.setViewportSize(viewport);
      await gotoGrades(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`ESP grades at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page, { career: "esp" });
      await page.setViewportSize(viewport);
      await gotoGrades(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`playground at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page);
      await page.setViewportSize(viewport);
      await gotoPlayground(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`statistics at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page);
      await page.setViewportSize(viewport);
      await gotoStatistics(page);
      await page.waitForTimeout(500);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`forecast at ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await seedProfile(page);
      await page.setViewportSize(viewport);
      await gotoForecast(page);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }

  test("mobile bottom nav is visible instead of top nav links", async ({ page }) => {
    await seedProfile(page);
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoDashboard(page);

    await expect(page.locator('[data-tour="bottom-nav"]')).toBeVisible();
  });

  test("desktop top nav is visible instead of bottom nav", async ({ page }) => {
    await seedProfile(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoDashboard(page);

    await expect(page.locator('[data-tour="navbar-links"]')).toBeVisible();
    await expect(page.locator('[data-tour="bottom-nav"]')).toBeHidden();
  });
});

// The overflow suite above only ever seeds the default (English) locale.
// Spanish and Portuguese strings run noticeably longer in several spots
// (e.g. career names, honor labels), which is exactly the kind of thing
// that fits fine in English but overflows or wraps badly once translated —
// a class of bug English-only testing can never catch.
test.describe("Responsive layout - no horizontal overflow in es/pt at mobile width", () => {
  for (const locale of ["es", "pt"] as const) {
    test(`dashboard in ${locale} at mobile (375px)`, async ({ page }) => {
      await seedProfile(page, { locale });
      await page.setViewportSize({ width: 375, height: 800 });
      await gotoDashboard(page, locale);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`Commercial SE grades in ${locale} at mobile (375px)`, async ({ page }) => {
      await seedProfile(page, { locale });
      await page.setViewportSize({ width: 375, height: 800 });
      await gotoGrades(page, locale);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`ESP grades in ${locale} at mobile (375px)`, async ({ page }) => {
      await seedProfile(page, { locale, career: "esp" });
      await page.setViewportSize({ width: 375, height: 800 });
      await gotoGrades(page, locale);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`statistics in ${locale} at mobile (375px)`, async ({ page }) => {
      await seedProfile(page, { locale });
      await page.setViewportSize({ width: 375, height: 800 });
      await gotoStatistics(page, locale);
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });

    test(`about page in ${locale} at mobile (375px)`, async ({ page }) => {
      await seedProfile(page, { locale });
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(`/${locale}/about`, { waitUntil: "networkidle" });
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});
