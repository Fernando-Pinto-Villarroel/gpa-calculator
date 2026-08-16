import { test, expect } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  gotoPlayground,
  readLocalStorageJson,
} from "./fixtures";

test.describe("Persistence - Commercial SE grades", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("a graded course survives a full page reload", async ({ page }) => {
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("A");

    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("A");
  });

  test("grades for different cohorts are stored independently and both survive reload", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    const initialCohort = await readLocalStorageJson<{
      state: { selectedCohortId: string };
    }>(page, "jala-gpa-store");
    const cohortA = initialCohort!.state.selectedCohortId;

    await page.locator('[data-tour="cohort-selector"] button').first().click();
    await page.waitForTimeout(200);
    await page
      .locator('[data-tour="cohort-selector"]')
      .getByRole("button")
      .nth(1)
      .click();
    await page.waitForTimeout(300);

    const afterSwitch = await readLocalStorageJson<{
      state: { selectedCohortId: string };
    }>(page, "jala-gpa-store");
    const cohortB = afterSwitch!.state.selectedCohortId;
    expect(cohortB).not.toBe(cohortA);

    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("—");

    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "B", exact: true }).click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("B");

    await page.reload({ waitUntil: "networkidle" });

    const store = await readLocalStorageJson<{
      state: {
        selectedCohortId: string;
        gradesByCohort: Record<string, Record<string, unknown>>;
      };
    }>(page, "jala-gpa-store");
    const firstGradedCourseA = Object.keys(store!.state.gradesByCohort[cohortA])[0];
    const firstGradedCourseB = Object.keys(store!.state.gradesByCohort[cohortB])[0];
    expect(store!.state.gradesByCohort[cohortA][firstGradedCourseA]).toBe("A");
    expect(store!.state.gradesByCohort[cohortB][firstGradedCourseB]).toBe("B");
    expect(store!.state.selectedCohortId).toBe(cohortB);
  });

  test("selected cohort and term persist across reload", async ({ page }) => {
    await page.locator('[data-tour="cohort-selector"] button').first().click();
    await page.waitForTimeout(200);
    await page
      .locator('[data-tour="cohort-selector"]')
      .getByRole("button")
      .nth(1)
      .click();
    await page.waitForTimeout(300);

    const beforeReload = await readLocalStorageJson<{
      state: { selectedCohortId: string; selectedTermId: string };
    }>(page, "jala-gpa-store");

    await page.reload({ waitUntil: "networkidle" });

    const afterReload = await readLocalStorageJson<{
      state: { selectedCohortId: string; selectedTermId: string };
    }>(page, "jala-gpa-store");

    expect(afterReload!.state.selectedCohortId).toBe(beforeReload!.state.selectedCohortId);
    expect(afterReload!.state.selectedTermId).toBe(beforeReload!.state.selectedTermId);
  });
});

test.describe("Persistence - ESP grades", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
  });

  test("a graded ESP course survives a full page reload", async ({ page }) => {
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "B+", exact: true }).click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("B+");

    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("B+");

    const store = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-esp-gpa-store");
    const cohortEntries = Object.values(store!.state.gradesByCohort)[0];
    expect(Object.values(cohortEntries)).toContain("B+");
  });
});

test.describe("Persistence - Playground custom assignments/groups", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoPlayground(page);
  });

  test("a renamed course title survives reload", async ({ page }) => {
    const title = page.locator('[data-tour="playground-title"]').first();
    await title.dblclick();
    const input = page.locator('input[data-tour="playground-title"]');
    await input.fill("My Persisted Course");
    await input.blur();
    await expect(title).toContainText("My Persisted Course");

    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator('[data-tour="playground-title"]').first()).toContainText(
      "My Persisted Course",
    );
  });

  test("a renamed group and a new assignment both survive reload", async ({ page }) => {
    const textarea = page.locator('[data-tour="playground-groups-table"] textarea').first();
    await textarea.fill("My Custom Group");
    await textarea.blur();

    await page.locator('[data-tour="playground-add-assignment"]').click();
    const rows = page.locator('button[title="Remove assignment"]').locator("..");
    const newRowCountBefore = await rows.count();

    await page.reload({ waitUntil: "networkidle" });

    await expect(
      page.locator('[data-tour="playground-groups-table"] textarea').first(),
    ).toHaveValue("My Custom Group");

    const rowsAfter = page.locator('button[title="Remove assignment"]').locator("..");
    await expect(rowsAfter).toHaveCount(newRowCountBefore);
  });
});
