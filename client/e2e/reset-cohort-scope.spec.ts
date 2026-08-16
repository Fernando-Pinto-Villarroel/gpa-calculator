import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, readLocalStorageJson } from "./fixtures";

async function readGrades(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<{
    state: { gradesByCohort: Record<string, Record<string, unknown>> };
  }>(page, "jala-gpa-store");
  return store!.state.gradesByCohort["cohort-2-2026"];
}

test.describe("Reset Cohort clears grades across every term, not just the viewed one", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("Reset Cohort clears both the viewed term and an unviewed term", async ({ page }) => {
    // Grade a course in Term I (the default view).
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    // Switch to Term II and grade a course there too.
    await page.locator('[data-tour="term-selector"] button').first().click();
    await page.getByRole("button", { name: "Term II", exact: true }).click();
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "B", exact: true }).click();

    // Switch back to Term I so it's the term visible when Reset Cohort runs.
    await page.locator('[data-tour="term-selector"] button').first().click();
    await page.getByRole("button", { name: "Term I", exact: true }).click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("A");

    const before = await readGrades(page);
    const gradedBefore = Object.entries(before).filter(([, v]) => v !== null);
    expect(gradedBefore.length).toBe(2);

    await page.locator('button[aria-label="Actions"]').click();
    await page.getByText("Reset Data").click();
    await page.getByRole("button", { name: "Reset Cohort" }).click();
    await page.getByRole("button", { name: "Yes, reset it" }).click();

    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("—");

    const after = await readGrades(page);
    const gradedAfter = Object.entries(after).filter(([, v]) => v !== null);
    expect(gradedAfter.length).toBe(0);

    // Confirm Term II's grade specifically was cleared too, not just Term I's.
    await page.locator('[data-tour="term-selector"] button').first().click();
    await page.getByRole("button", { name: "Term II", exact: true }).click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("—");
  });
});
