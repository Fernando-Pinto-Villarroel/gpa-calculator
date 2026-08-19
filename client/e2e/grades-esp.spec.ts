import path from "path";
import { test, expect } from "@playwright/test";
import { seedProfile, switchCareer, gotoGrades, readLocalStorageJson } from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

interface GradesStoreShape {
  state: { selectedCohortId: string; gradesByCohort: Record<string, Record<string, string | null>> };
}

async function getStoreGrades(page: import("@playwright/test").Page, storageKey: string) {
  const store = await readLocalStorageJson<GradesStoreShape>(page, storageKey);
  const cohortId = store?.state.selectedCohortId ?? "cohort-2-2026";
  return store?.state.gradesByCohort[cohortId] ?? {};
}

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

  test("ESP actions menu has backup import/export, SIS PDF import, Canvas Playground, and reset", async ({
    page,
  }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    await expect(page.getByText("Import Cohort Backup")).toBeVisible();
    await expect(page.getByText("Export Cohort Backup")).toBeVisible();
    await expect(page.getByText("Import from SIS PDF")).toBeVisible();
    await expect(page.getByText("Canvas Course Playground")).toBeVisible();
    await expect(page.getByText("Reset Data")).toBeVisible();
  });

  test("Canvas Playground is reachable from the ESP actions menu", async ({ page }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    await page.getByText("Canvas Course Playground").click();

    await expect(page).toHaveURL(/\/grades\/playground/);
  });

  // fer.pdf's SIS export contains both Commercial SE and ESP courses. Importing
  // it from the ESP grades page should populate both cohorts, the same way
  // importing it from the Commercial SE grades page already does.
  test("importing a real SIS PDF from the ESP page populates both ESP and Commercial SE grades", async ({
    page,
  }) => {
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(TEST_DATA, "fer.pdf"));

    await expect(page.getByText(/courses with grades were found/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByText(/Also found \d+ Software Engineering course grade\(s\)/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Yes, import grades" }).click();
    await expect(page.getByText(/Grades Imported|Successfully imported/)).toBeVisible();

    const espGrades = await getStoreGrades(page, "jala-esp-gpa-store");
    expect(espGrades["ESP-501"]).toBe("A");

    const commercialGrades = await getStoreGrades(page, "jala-gpa-store");
    expect(Object.keys(commercialGrades).length).toBeGreaterThan(0);
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
