import { test, expect, Page } from "@playwright/test";

function seedTour(page: Page, state: Record<string, unknown>) {
  return page.addInitScript((tourState) => {
    if (sessionStorage.getItem("seeded-tour")) return;
    sessionStorage.setItem("seeded-tour", "1");
    localStorage.setItem("jala-gpa-tour", JSON.stringify({ state: tourState, version: 0 }));
  }, state);
}

const dialog = (page: Page) => page.getByRole("dialog", { name: /What's new in version 2\.0\.0/ });

test.describe("What's new in version 2", () => {
  test("someone who finished the v1 tour sees the dialog once, and 'Maybe later' dismisses it for good", async ({
    page,
  }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/en", { waitUntil: "networkidle" });

    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toContainText("ESP certificate program");
    await page.getByRole("button", { name: "Maybe later" }).click();
    await expect(dialog(page)).toHaveCount(0);

    await page.reload({ waitUntil: "networkidle" });
    await expect(dialog(page)).toHaveCount(0);
  });

  test("'Take the tour' closes the dialog and starts the guided tour on the dashboard", async ({ page }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/en/about", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Take the tour" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({ timeout: 10_000 });
  });

  test("Escape closes the dialog", async ({ page }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/es", { waitUntil: "networkidle" });
    await expect(page.getByRole("dialog", { name: /Novedades de la versión 2\.0\.0/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a new user gets the tour, and skipping it never shows the dialog afterwards", async ({ page }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({ timeout: 10_000 });
    await expect(dialog(page)).toHaveCount(0);

    await page.locator('[data-testid="tour-skip-tour-button"]').click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(dialog(page)).toHaveCount(0);
  });
});
