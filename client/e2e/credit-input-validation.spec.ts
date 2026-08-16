import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, readLocalStorageJson } from "./fixtures";

async function readFirstCourseEntry(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<{
    state: { gradesByCohort: Record<string, Record<string, unknown>> };
  }>(page, "jala-gpa-store");
  if (!store) return undefined;
  return store.state.gradesByCohort["cohort-2-2026"]["CSPR-111"];
}

// CourseCard.saveCredits: `if (!isNaN(num) && num >= 1 && num <= 4)` — values
// outside [1, 4] (or non-numeric) are silently discarded, leaving the
// original credits untouched. This documents that behavior explicitly.
test.describe("Credits override input - boundary and invalid values", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  async function tryEnterCredits(page: import("@playwright/test").Page, value: string) {
    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    const creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill(value);
    await creditInput.blur();
  }

  test("0 (below minimum) is rejected, original credits stay unchanged", async ({ page }) => {
    await tryEnterCredits(page, "0");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("2 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toBeUndefined();
  });

  test("5 (above maximum) is rejected, original credits stay unchanged", async ({ page }) => {
    await tryEnterCredits(page, "5");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("2 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toBeUndefined();
  });

  test("a negative value is rejected, original credits stay unchanged", async ({ page }) => {
    await tryEnterCredits(page, "-1");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("2 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toBeUndefined();
  });

  test("an empty value is rejected, original credits stay unchanged", async ({ page }) => {
    await tryEnterCredits(page, "");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("2 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toBeUndefined();
  });

  test("4 (the maximum) is accepted as a valid override", async ({ page }) => {
    await tryEnterCredits(page, "4");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("4 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 4, grade: null, approved: false }]);
  });

  test("1 (the minimum) is accepted as a valid override", async ({ page }) => {
    await tryEnterCredits(page, "1");
    await expect(page.locator('[data-tour="first-credits-badge"]')).toContainText("1 cr");
    const entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 1, grade: null, approved: false }]);
  });
});
