import { test, expect } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  gotoDashboard,
  gotoStatistics,
  gotoForecast,
} from "./fixtures";

test.describe("Cross-feature propagation - Commercial SE", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
  });

  test("grading a course updates Dashboard, Statistics, and Forecast consistently", async ({
    page,
  }) => {
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await gotoDashboard(page);
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    const completedValue = await page
      .locator('[data-tour="stat-cards"]')
      .getByText("1", { exact: true })
      .first();
    await expect(completedValue).toBeVisible();
    await expect(page.getByText("4.").first()).toBeVisible();

    await gotoStatistics(page);
    await page.waitForSelector("text=Compiling", { state: "detached", timeout: 5000 }).catch(() => {});
    await expect(page.getByText("4.000")).toBeVisible();
    await expect(page.getByText("Cum Laude").first()).toBeVisible();

    await gotoForecast(page);
    await expect(page.getByText("4.000").first()).toBeVisible();
  });
});

test.describe("Cross-feature propagation - ESP", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page, { career: "esp" });
  });

  test("grading an ESP course updates Dashboard, Statistics, and Forecast consistently", async ({
    page,
  }) => {
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "B+", exact: true }).click();

    await gotoDashboard(page);
    await expect(page.getByText("Courses Passed").first()).toBeVisible();
    await expect(page.getByText("3.3").first()).toBeVisible();

    await gotoStatistics(page);
    await page.waitForSelector("text=Compiling", { state: "detached", timeout: 5000 }).catch(() => {});
    await expect(page.getByText("3.300")).toBeVisible();

    await gotoForecast(page);
    await expect(page.getByText("3.300").first()).toBeVisible();
  });
});
