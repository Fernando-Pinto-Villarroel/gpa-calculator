import path from "path";
import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades } from "./fixtures";

const FER_PDF = path.resolve(__dirname, "../../test-data/fer.pdf");

test.describe("Grades - Commercial Software Engineering", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
  });

  test("shows cohort/term selectors and default module grid", async ({ page }) => {
    await gotoGrades(page);

    await expect(page.locator('[data-tour="cohort-selector"]')).toContainText("Cohort 8");
    await expect(page.locator('[data-tour="term-selector"]')).toContainText("Term I");
    await expect(page.getByText("Term GPA:")).toBeVisible();
    await expect(page.getByText("0.00")).toBeVisible();

    await expect(page.getByText("MODULE 1").first()).toBeVisible();
    await expect(page.getByText("MODULE 2").first()).toBeVisible();
    await expect(page.getByText("MODULE 3").first()).toBeVisible();
    await expect(page.getByText("Programming 1").first()).toBeVisible();
  });

  test("grading a course updates Term GPA", async ({ page }) => {
    await gotoGrades(page);

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await firstCard.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await expect(page.getByText("4.00")).toBeVisible();
  });

  test("switching cohort resets to term I and preserves per-cohort grades", async ({ page }) => {
    await gotoGrades(page);

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await firstCard.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await expect(page.getByText("4.00")).toBeVisible();

    await page.locator('[data-tour="cohort-selector"]').click();
    await page.getByRole("button", { name: /Cohort 1 \(I - 2023\)/ }).click();
    await expect(page.locator('[data-tour="cohort-selector"]')).toContainText("Cohort 1");
    await expect(page.getByText("0.00")).toBeVisible();

    await page.locator('[data-tour="cohort-selector"]').click();
    await page.getByRole("button", { name: /Cohort 8/ }).click();
    await expect(page.getByText("4.00")).toBeVisible();
  });

  test("reset term clears grades back to defaults", async ({ page }) => {
    await gotoGrades(page);

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await firstCard.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await expect(page.getByText("4.00")).toBeVisible();

    await page.locator('button[aria-label="Actions"]').click();
    await page.getByText("Reset Data").click();
    await page.getByRole("button", { name: "Reset Term" }).click();
    await page.getByRole("button", { name: "Yes, reset it" }).click();

    await expect(page.getByText("0.00")).toBeVisible();
  });

  test("export downloads a JSON backup file", async ({ page }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByText("Export Cohort Backup").click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test("import backup JSON applies grades", async ({ page }) => {
    await gotoGrades(page);

    const payload = {
      version: 2,
      cohortId: "cohort-2-2026",
      grades: { "CSPR-111": "A" },
    };

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import Cohort Backup").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(payload)),
    });

    await page.getByRole("button", { name: "Yes, reset it" }).click();

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await expect(firstCard.getByRole("button", { name: "A", exact: true })).toBeVisible();
  });

  test("import a real Canvas SIS PDF report card", async ({ page }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FER_PDF);

    await expect(page.getByText(/courses with grades were found/)).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole("button", { name: "Yes, import grades" }).click();

    await expect(page.getByText(/Grades Imported|Successfully imported/)).toBeVisible();
  });
});
