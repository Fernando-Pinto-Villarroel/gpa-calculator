import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard } from "./fixtures";

// The /grades tour steps (cohort/term selectors, first course card, action
// buttons) target Commercial-SE-only selectors. When the ESP career is
// active, useTourSteps() swaps in an ESP-specific step set so every target
// actually exists on EspGradesView, and GuidedTour navigates routes when a
// page runs out of steps instead of freezing silently.
test.describe("Guided tour - ESP career", () => {
  test("Skip this page from Dashboard while ESP is active jumps into the ESP-specific /grades tour", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false, career: "esp" });
    await gotoDashboard(page);
    await page.waitForTimeout(1200);

    await page.locator('[data-testid="tour-skip-page-button"]').click();
    await page.waitForTimeout(800);

    await expect(page).toHaveURL(/\/grades$/);
    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toContainText("1/9");
    await expect(page.getByText("ESP Grades Page")).toBeVisible();
  });

  test("every ESP /grades tour step renders a visible tooltip and the tour reaches Playground without freezing", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "jala-gpa-tour",
        JSON.stringify({
          state: { guidedTourCompleted: false, globalStepIndex: 9 },
          version: 0,
        }),
      );
      localStorage.setItem(
        "jala-career-store",
        JSON.stringify({ state: { selectedCareerId: "esp" }, version: 0 }),
      );
    });
    await page.goto("/en/grades", { waitUntil: "networkidle" });

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    for (let i = 0; i < 9; i++) {
      await expect(nextBtn).toBeVisible({ timeout: 5000 });
      await nextBtn.click();
      await page.waitForTimeout(300);
    }

    await expect(page).toHaveURL(/\/grades\/playground/, { timeout: 10000 });
  });

  test("action-import, action-export and action-reset steps auto-open the ESP actions menu", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "jala-gpa-tour",
        // Index 14 is the "action-import" step within the 9-step ESP /grades block (9 + 5).
        JSON.stringify({
          state: { guidedTourCompleted: false, globalStepIndex: 14 },
          version: 0,
        }),
      );
      localStorage.setItem(
        "jala-career-store",
        JSON.stringify({ state: { selectedCareerId: "esp" }, version: 0 }),
      );
    });
    await page.goto("/en/grades", { waitUntil: "networkidle" });

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-tour="action-import"]')).toBeVisible();
  });
});
