import { test, expect } from "@playwright/test";
import { seedProfile, gotoForecast, gotoGrades } from "./fixtures";

test.describe("Forecast", () => {
  test("shows scope toggle, target GPA, and quick scenarios for a fresh profile", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoForecast(page);

    await expect(page.getByRole("button", { name: "Term", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cumulative", exact: true })).toBeVisible();
    await expect(page.getByText("Target GPA")).toBeVisible();

    await expect(page.getByText("Cum Laude (3.2)")).toBeVisible();
    await expect(page.getByText("Magna Cum Laude (3.5)")).toBeVisible();
    await expect(page.getByText("Summa Cum Laude (3.8)")).toBeVisible();

    await expect(page.getByText("Quick Scenarios")).toBeVisible();
    await expect(page.getByText("Remaining Courses", { exact: true })).toBeVisible();
    await expect(page.getByText("Feasibility", { exact: true })).toBeVisible();
  });

  test("changing target GPA updates feasibility live", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);

    const targetInput = page.locator('input[type="number"]').first();
    await targetInput.fill("4.0");
    await page.waitForTimeout(600);

    await expect(page.getByText("Quick Scenarios")).toBeVisible();
  });

  test("term scope shows a term selector dropdown", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);

    await page.getByRole("button", { name: "Term", exact: true }).click();
    await expect(page.locator('[data-tour="forecast-scope"]')).toBeVisible();
    await expect(page.locator("select")).toBeVisible();
  });

  test("ESP forecast shows Level options and no credit units", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);

    await page.getByRole("button", { name: "Term", exact: true }).click();
    const options = await page.locator("select option").allTextContents();
    expect(options.some((o) => o.includes("Level"))).toBe(true);

    await expect(page.getByText(/\(\d+ cr\)/)).toHaveCount(0);
  });

  // Regression coverage for a floating-point bug: currentGpa is computed via
  // division (qualityPoints / credits), which can land a hair below an exact
  // decimal (e.g. 3.6999999999999997 instead of 3.7) even though it displays
  // as "3.700". A naive `currentGpa >= targetGpa` comparison then missed a
  // target that was genuinely already met.
  test("setting the target GPA equal to the current cumulative GPA shows 'Already achieved', not 'Achievable'", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    // Grade enough courses with A- (3.7) that the resulting division is one
    // of the credit totals known to produce float noise (19, 38, 43...).
    const dashes = page.getByRole("button", { name: "—" });
    let remaining = await dashes.count();
    let graded = 0;
    while (remaining > 0 && graded < 8) {
      const trigger = dashes.first();
      const wrapper = trigger.locator("..");
      await trigger.click();
      await wrapper.getByRole("button", { name: "A-", exact: true }).click();
      await page.waitForTimeout(150);
      remaining = await dashes.count();
      graded++;
    }

    await expect(page.getByText("3.70").first()).toBeVisible();

    await gotoForecast(page);
    await page.getByRole("button", { name: "Cumulative", exact: true }).click();
    const targetInput = page.locator('input[type="number"]').first();
    await targetInput.fill("3.7");
    await page.waitForTimeout(600);

    await expect(page.getByText("Already achieved! Your current GPA meets this target.")).toBeVisible();
  });

  test("a locked-in F grade that makes a 4.0 target mathematically unreachable shows 'Not achievable'", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const trigger = page.getByRole("button", { name: "—" }).first();
    const wrapper = trigger.locator("..");
    await trigger.click();
    await wrapper.getByRole("button", { name: "F", exact: true }).click();
    await page.getByText("No, keep single grade").click();

    await gotoForecast(page);
    await page.getByRole("button", { name: "Cumulative", exact: true }).click();
    const targetInput = page.locator('input[type="number"]').first();
    await targetInput.fill("4.0");
    await page.waitForTimeout(600);

    await expect(
      page.getByText("Not achievable — even with all A grades, this target cannot be reached."),
    ).toBeVisible();
  });

  test("a fully graded term (0 remaining courses) still resolves Term feasibility correctly", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const dashes = page.getByRole("button", { name: "—" });
    let remaining = await dashes.count();
    while (remaining > 0) {
      const trigger = dashes.first();
      const wrapper = trigger.locator("..");
      await trigger.click();
      await wrapper.getByRole("button", { name: "A", exact: true }).click();
      await page.waitForTimeout(150);
      remaining = await dashes.count();
    }

    await gotoForecast(page);
    // Default scope is Term, which now has 0 remaining courses.
    const targetInput = page.locator('input[type="number"]').first();
    await targetInput.fill("3.5");
    await page.waitForTimeout(600);

    await expect(page.getByText("Already achieved! Your current GPA meets this target.")).toBeVisible();
    await expect(page.getByText("Remaining Courses", { exact: true })).toBeVisible();
    await expect(page.getByText("0").first()).toBeVisible();
  });
});
