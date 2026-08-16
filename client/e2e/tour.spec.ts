import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard, readLocalStorageJson } from "./fixtures";

test.describe("Guided tour", () => {
  test("auto-starts for a fresh profile and can be advanced with Next", async ({ page }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toContainText("1/9");

    await nextBtn.click();
    await expect(nextBtn).toContainText("2/9");
  });

  test("Back button returns to the previous step", async ({ page }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    await page.locator('[data-testid="tour-next-button"]').click();
    await page.waitForTimeout(300);
    await page.locator('[data-testid="tour-next-button"]').click();
    await page.waitForTimeout(300);

    await page.locator('[data-testid="tour-back-button"]').click();
    await expect(page.locator('[data-testid="tour-next-button"]')).toContainText("2/9");
  });

  test("Skip Tour ends the tour entirely", async ({ page }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    await page.locator('[data-testid="tour-skip-tour-button"]').click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="tour-next-button"]')).toHaveCount(0);

    const state = await readLocalStorageJson<{ state: { guidedTourCompleted: boolean } }>(
      page,
      "jala-gpa-tour",
    );
    expect(state?.state.guidedTourCompleted).toBe(true);
  });

  test("Skip this page jumps to the next page's first step, tour stays active", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    await page.locator('[data-testid="tour-skip-page-button"]').click();
    await page.waitForTimeout(800);

    await expect(page).toHaveURL(/\/grades$/);
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible();

    const state = await readLocalStorageJson<{ state: { guidedTourCompleted: boolean } }>(
      page,
      "jala-gpa-tour",
    );
    expect(state?.state.guidedTourCompleted).toBe(false);
  });

  test("shows Next Page at the end of a page's steps, and Finish only at the true end", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    for (let i = 0; i < 8; i++) {
      await nextBtn.click();
      await page.waitForTimeout(300);
    }
    await expect(nextBtn).toHaveText("Next Page");

    await nextBtn.click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/grades$/);
  });

  test("restart tour from the header actions menu", async ({ page }) => {
    await seedProfile(page, { tourCompleted: true });
    await gotoDashboard(page);

    await page.locator('button[aria-label="More Options"]').click();
    await page.getByText("Restart Tour").click();
    await page.waitForTimeout(800);

    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible();
  });
});
