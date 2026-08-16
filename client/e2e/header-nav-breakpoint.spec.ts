import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard } from "./fixtures";

// The header's nav links are centered via `absolute left-1/2 -translate-x-1/2`,
// so they don't reflow with the career selector / hamburger group next to
// them. The old `md:` (768px) breakpoint left a "dead zone" up to ~1100px
// where the nav links were visible but too wide to fit without overlapping
// the career selector — reproducible just by zooming a normal desktop
// browser to 110-120%. Fixed with a custom `nav:` breakpoint (72rem/1152px).
async function boxesOverlap(
  a: { x: number; y: number; width: number; height: number } | null,
  b: { x: number; y: number; width: number; height: number } | null,
) {
  if (!a || !b) return false;
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

test.describe("Header nav-links vs career selector never overlap", () => {
  test.beforeEach(async ({ page }) => {
    // ESP has the longest career label, the worst case for this collision.
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);
  });

  test("below the nav breakpoint (1024px, formerly broken): nav links are hidden, hamburger mode is used", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await page.waitForTimeout(150);

    await expect(page.locator('[data-tour="navbar-links"]')).toBeHidden();
    await expect(page.locator('button[aria-label="Career"]')).toBeVisible();
  });

  test("just below the breakpoint (1151px): still hamburger mode", async ({ page }) => {
    await page.setViewportSize({ width: 1151, height: 700 });
    await page.waitForTimeout(150);

    await expect(page.locator('[data-tour="navbar-links"]')).toBeHidden();
  });

  test("at and above the breakpoint (1152px+): nav links are visible and never overlap the career selector", async ({
    page,
  }) => {
    for (const width of [1152, 1200, 1280, 1440]) {
      await page.setViewportSize({ width, height: 700 });
      await page.waitForTimeout(150);

      const navLinks = page.locator('[data-tour="navbar-links"]');
      await expect(navLinks).toBeVisible();

      const navBox = await navLinks.boundingBox();
      const careerBox = await page.locator('button[aria-label="Career"]').boundingBox();

      expect(await boxesOverlap(navBox, careerBox)).toBe(false);
    }
  });
});
