import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, readLocalStorageJson } from "./fixtures";

test.describe("Retake modal - real UI flow", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("marking a course as retaken opens the asking view, then the managing view", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await expect(page.getByText("Did you fail this course?")).toBeVisible();

    await page.getByText("Yes, mark as retaken").click();
    await expect(page.getByText("Attempt 1")).toBeVisible();
    await expect(page.getByText("Add Attempt")).toBeVisible();
  });

  test("adding a second attempt sums quality points across all attempts", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();

    // First attempt defaults to F, unapproved.
    await page.getByText("Add Attempt").click();
    await expect(page.getByText("Attempt 2")).toBeVisible();

    // Set attempt 2's grade to A via its own dropdown.
    const attempt2 = page.getByText("Attempt 2", { exact: true }).locator("../..");
    await attempt2.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    // Approve attempt 2.
    await attempt2.locator("button").last().click();

    await page.getByText("Save", { exact: true }).click();

    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("A");
    await expect(page.getByText("Term GPA:")).toBeVisible();
    // Quality points sum across ALL attempts (not just the approved one) —
    // F (0.0 * 2cr) + A (4.0 * 2cr) = 8 quality points / 4 attempted credits.
    await expect(page.getByText("2.00")).toBeVisible();
  });

  test("a credit override on a single approved attempt is reflected in the course card", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();

    const attemptRow = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await attemptRow.locator('input[type="number"]').fill("4");
    await attemptRow.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "B", exact: true }).click();
    await attemptRow.locator("button").last().click();

    await page.getByText("Save", { exact: true }).click();

    const store = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-gpa-store");
    const entry = store!.state.gradesByCohort["cohort-2-2026"]["CSPR-111"];
    expect(entry).toEqual([{ credits: 4, grade: "B", approved: true }]);
  });

  test("removing an attempt is only available with more than one attempt", async ({ page }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();

    await expect(page.getByText("Remove")).toHaveCount(0);

    await page.getByText("Add Attempt").click();
    await expect(page.getByText("Remove").first()).toBeVisible();
  });

  test("closing without saving leaves the grade unchanged", async ({ page }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();
    await page.getByText("Close", { exact: true }).click();

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await expect(firstCard.getByRole("button", { name: "—" })).toBeVisible();
  });
});
