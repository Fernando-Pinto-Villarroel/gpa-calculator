import { test, expect } from "@playwright/test";
import { seedProfile, switchCareer, gotoGrades } from "./fixtures";

test.describe("Grades - ESP", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page, { career: "esp" });
  });

  test("shows its own cohort selector, no term selector, 3 Level columns", async ({ page }) => {
    await gotoGrades(page);

    await expect(page.locator('[data-tour="esp-cohort-selector"]')).toContainText("Cohort 8");
    await expect(page.locator('[data-tour="term-selector"]')).toHaveCount(0);
    await expect(page.locator('[data-tour="cohort-selector"]')).toHaveCount(0);

    await expect(page.getByText("LEVEL 1").first()).toBeVisible();
    await expect(page.getByText("LEVEL 2").first()).toBeVisible();
    await expect(page.getByText("LEVEL 3").first()).toBeVisible();

    await expect(
      page.getByText("ESP 1 - Beginning English for Software Engineers I").first(),
    ).toBeVisible();
    await expect(page.getByText("Special Lab M13").first()).toBeVisible();
    await expect(page.getByText("ESP 6 - English for Software Engineering II").first()).toBeVisible();

    await expect(page.getByText("Cumulative GPA:")).toBeVisible();
    await expect(page.getByText("0.00")).toBeVisible();

    const creditBadges = page.getByText("0 cr").first();
    await expect(creditBadges).toBeVisible();
  });

  test("grading an ESP course updates cumulative GPA using gpaWeight, not 0 credits", async ({
    page,
  }) => {
    await gotoGrades(page);

    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await expect(page.getByText("4.00")).toBeVisible();
  });

  test("ESP actions menu has no PDF import option, only backup + reset", async ({ page }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    await expect(page.getByText("Import Cohort Backup")).toBeVisible();
    await expect(page.getByText("Export Cohort Backup")).toBeVisible();
    await expect(page.getByText("Reset Data")).toBeVisible();
    await expect(page.getByText("Import from SIS PDF")).toHaveCount(0);
  });

  test("ESP cohort selector is independent from Commercial SE's", async ({ page }) => {
    await gotoGrades(page);

    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.getByRole("button", { name: /Cohort 1 \(I - 2023\)/ }).click();
    await expect(page.locator('[data-tour="esp-cohort-selector"]')).toContainText("Cohort 1");

    await switchCareer(page, "commercial");
    await gotoGrades(page);
    await expect(page.locator('[data-tour="cohort-selector"]')).toContainText("Cohort 8");
  });
});
