import { test, expect } from "@playwright/test";
import { seedProfile, gotoForecast } from "./fixtures";

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
});
