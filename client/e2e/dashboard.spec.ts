import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard } from "./fixtures";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
  });

  test("shows empty state and default header chrome", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.getByText("No grades entered yet").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter Grades" }).first()).toBeVisible();

    await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Grades", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Statistics" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forecast" })).toBeVisible();

    await expect(page.locator('button[aria-label="Career"]')).toContainText(
      "Commercial Software",
    );
  });

  test("shows all stat cards with zeroed values", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    await expect(page.getByText("Best Grade").first()).toBeVisible();
    await expect(page.getByText("Terms Completed").first()).toBeVisible();
    await expect(page.getByText("Dean's List Terms").first()).toBeVisible();
    await expect(page.getByText("Lowest Grade").first()).toBeVisible();
    await expect(page.getByText("Earned Credits").first()).toBeVisible();
    await expect(page.getByText("Remaining Credits").first()).toBeVisible();
    await expect(page.getByText("President's List Terms").first()).toBeVisible();

    await expect(page.getByText("133", { exact: true }).first()).toBeVisible();
  });

  test("shows honor threshold markers", async ({ page }) => {
    await gotoDashboard(page);

    await expect(page.getByText("Cum Laude").first()).toBeVisible();
    await expect(page.getByText("Magna").first()).toBeVisible();
    await expect(page.getByText("Summa").first()).toBeVisible();
    await expect(page.getByText("3.20").first()).toBeVisible();
    await expect(page.getByText("3.50").first()).toBeVisible();
    await expect(page.getByText("3.80").first()).toBeVisible();
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await gotoDashboard(page);
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });
});
