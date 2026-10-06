import { test, expect, Page } from "@playwright/test";

function seedTour(page: Page, state: Record<string, unknown>) {
  return page.addInitScript((tourState) => {
    if (sessionStorage.getItem("seeded-tour")) return;
    sessionStorage.setItem("seeded-tour", "1");
    localStorage.setItem(
      "jala-gpa-tour",
      JSON.stringify({ state: tourState, version: 0 }),
    );
  }, state);
}

const dialog = (page: Page) =>
  page.getByRole("dialog", { name: /What's new in version 2\.0\.0/ });

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

  test("'Take the tour' closes the dialog and starts the guided tour on the dashboard", async ({
    page,
  }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/en/about", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: "Take the tour" }).click();
    await expect(dialog(page)).toHaveCount(0);
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Escape closes the dialog", async ({ page }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/es", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("dialog", { name: /Novedades de la versión 2\.0\.0/ }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a new user gets the tour, and skipping it never shows the dialog afterwards", async ({
    page,
  }) => {
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog(page)).toHaveCount(0);

    await page.locator('[data-testid="tour-skip-tour-button"]').click();
    await page.reload({ waitUntil: "networkidle" });
    await expect(dialog(page)).toHaveCount(0);
  });
});

test.describe("Reopening What's new from the About page", () => {
  test("clicking the version opens the dialog for anyone, and closing it does not reopen it", async ({
    page,
  }) => {
    await seedTour(page, {
      guidedTourCompleted: true,
      globalStepIndex: 0,
      whatsNewSeenVersion: "2.0.0",
    });
    await page.goto("/en/about", { waitUntil: "networkidle" });
    await expect(dialog(page)).toHaveCount(0);

    const version = page.getByRole("button", { name: /Version 2\.0\.1/ });
    const before = await version.evaluate((el) => {
      const s = getComputedStyle(el);
      return { color: s.color, decoration: s.textDecorationLine };
    });
    expect(before.decoration).toBe("none");

    await version.click();
    await expect(dialog(page)).toBeVisible();
    await page.getByRole("button", { name: "Maybe later" }).click();
    await expect(dialog(page)).toHaveCount(0);

    await version.click();
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toHaveCount(0);
  });
});

test.describe("What's new dialog language selector", () => {
  test("switching language keeps the dialog open and translates it", async ({
    page,
  }) => {
    await seedTour(page, { guidedTourCompleted: true, globalStepIndex: 0 });
    await page.goto("/en", { waitUntil: "networkidle" });
    await expect(dialog(page)).toBeVisible();

    await page
      .getByTestId("whats-new-locale")
      .getByRole("button", { name: "Español" })
      .click();
    await expect(page).toHaveURL(/\/es$/);
    await expect(
      page.getByRole("dialog", { name: /Novedades de la versión/ }),
    ).toBeVisible();
    await expect(
      page
        .getByTestId("whats-new-locale")
        .getByRole("button", { name: "Español" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
