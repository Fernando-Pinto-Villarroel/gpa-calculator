import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard } from "./fixtures";

// The Joyride overlay uses spotlightClicks={false}, which blocks all clicks
// on the real page during the tour — including the header's own language
// switcher, since it lives outside the tooltip. Fixed by adding a fully
// custom language dropdown directly inside TourTooltip itself (same pattern
// as CohortSelector/CareerSelector — not a native <select>, whose open
// popup can't be restyled), which stays interactive regardless of
// spotlightClicks.
test.describe("Guided tour - switching language mid-tour", () => {
  test("switching language on the Dashboard keeps the tour active at the same step", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page, "en");
    await page.waitForTimeout(1200);

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    await nextBtn.click();
    await page.waitForTimeout(300);
    await nextBtn.click();
    await page.waitForTimeout(300);
    await expect(nextBtn).toContainText("3/9");

    await page.locator('[data-testid="tour-locale-select"]').click();
    await page.locator('[data-testid="tour-locale-option-es"]').click();
    await page.waitForTimeout(800);

    await expect(page).toHaveURL(/\/es/);
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    await expect(nextBtn).toContainText("3/9");
    await expect(page.getByText("Navegación")).toBeVisible();
  });

  test("switching language on the Grades page keeps the tour active at the same step", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page, "en");
    await page.waitForTimeout(1200);

    const nextBtn = page.locator('[data-testid="tour-next-button"]');
    for (let i = 0; i < 8; i++) {
      await nextBtn.click();
      await page.waitForTimeout(250);
    }
    await nextBtn.click();
    await page.waitForTimeout(600);
    await expect(page).toHaveURL(/\/en\/grades/);
    await expect(nextBtn).toContainText("1/10");

    await page.locator('[data-testid="tour-locale-select"]').click();
    await page.locator('[data-testid="tour-locale-option-pt"]').click();
    await page.waitForTimeout(800);

    await expect(page).toHaveURL(/\/pt\/grades/);
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
    await expect(nextBtn).toContainText("1/10");
    await expect(page.getByText("Página de Notas")).toBeVisible();
  });

  test("the trigger shows the current language, and the active option is highlighted", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page, "es");
    await page.waitForTimeout(1200);

    const trigger = page.locator('[data-testid="tour-locale-select"]');
    await expect(trigger).toContainText("Español");

    await trigger.click();
    const activeOption = page.locator('[data-testid="tour-locale-option-es"]');
    const inactiveOption = page.locator('[data-testid="tour-locale-option-en"]');
    await expect(activeOption).toBeVisible();
    await expect(inactiveOption).toBeVisible();

    const activeCursor = await activeOption.evaluate((el) => getComputedStyle(el).cursor);
    const inactiveCursor = await inactiveOption.evaluate((el) => getComputedStyle(el).cursor);
    expect(activeCursor).toBe("default");
    expect(inactiveCursor).toBe("pointer");
  });

  test("clicking outside the open dropdown closes it without changing language", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false });
    await gotoDashboard(page, "en");
    await page.waitForTimeout(1200);

    await page.locator('[data-testid="tour-locale-select"]').click();
    await expect(page.locator('[data-testid="tour-locale-option-es"]')).toBeVisible();

    await page.getByText("This quick tour will guide you").click();
    await expect(page.locator('[data-testid="tour-locale-option-es"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/en/);
  });
});
