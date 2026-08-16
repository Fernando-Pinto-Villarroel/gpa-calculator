import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, readLocalStorageJson } from "./fixtures";

type StoredAttempt = { credits: number; grade: string | null; approved: boolean };
type GpaStoreShape = {
  state: { gradesByCohort: Record<string, Record<string, unknown>> };
};

async function readFirstCourseEntry(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<GpaStoreShape>(page, "jala-gpa-store");
  return store!.state.gradesByCohort["cohort-2-2026"]["CSPR-111"];
}

test.describe("Retake modal - edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("approving one attempt automatically un-approves the others", async ({ page }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();
    await page.getByText("Add Attempt").click();

    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    const attempt2 = page.getByText("Attempt 2", { exact: true }).locator("../..");

    await attempt1.locator("button").last().click();
    await expect(attempt1.locator("button").last()).toHaveClass(/text-success/);
    await expect(attempt2.locator("button").last()).not.toHaveClass(/text-success/);

    await attempt2.locator("button").last().click();
    await expect(attempt2.locator("button").last()).toHaveClass(/text-success/);
    await expect(attempt1.locator("button").last()).not.toHaveClass(/text-success/);

    await page.getByText("Save", { exact: true }).click();
    const entry = (await readFirstCourseEntry(page)) as StoredAttempt[];
    expect(entry[0].approved).toBe(false);
    expect(entry[1].approved).toBe(true);
  });

  test("removing the approved attempt leaves nothing approved, no silent fallback", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();
    await page.getByText("Add Attempt").click();

    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await attempt1.locator("button").last().click();
    await expect(attempt1.locator("button").last()).toHaveClass(/text-success/);

    await attempt1.getByText("Remove").click();
    await page.getByText("Save", { exact: true }).click();

    const entry = (await readFirstCourseEntry(page)) as StoredAttempt[];
    expect(entry).toHaveLength(1);
    expect(entry[0].approved).toBe(false);

    const card = page.locator('[data-tour="first-course-card"]');
    await expect(card).toContainText("1 att.");
  });

  test("reverting a single approved attempt with default credits converts back to a plain grade", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();

    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await attempt1.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "C", exact: true }).click();
    await attempt1.locator("button").last().click();

    await expect(page.getByText("You only have one attempt")).toBeVisible();
    await page.getByText("Revert to single grade mode").first().click();

    const entry = await readFirstCourseEntry(page);
    expect(entry).toBe("C");
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("C");
  });

  test("reverting a single approved attempt with overridden credits keeps the credit override", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-retake-btn"]').click();
    await page.getByText("Yes, mark as retaken").click();

    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await attempt1.locator('input[type="number"]').fill("3");
    await attempt1.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "C", exact: true }).click();
    await attempt1.locator("button").last().click();

    await page.getByText("Revert to single grade mode").first().click();

    const entry = (await readFirstCourseEntry(page)) as StoredAttempt[];
    expect(entry).toEqual([{ credits: 3, grade: "C", approved: true }]);

    const card = page.locator('[data-tour="first-course-card"]');
    await expect(card).toContainText("3 cr");
    await expect(card).toContainText("C");
  });

  test("setting a credit override then failing the grade preserves the overridden credits into the new retake attempt", async ({
    page,
  }) => {
    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    const creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("3");
    await creditInput.blur();
    await expect(badge).toContainText("3 cr");

    let entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 3, grade: null, approved: false }]);

    await page.locator('[data-tour="first-course-card"]').getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();

    await expect(page.getByText("Did you fail this course?")).toBeVisible();
    entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 3, grade: null, approved: false }]);

    await page.getByText("Yes, mark as retaken").click();
    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await expect(attempt1.locator('input[type="number"]')).toHaveValue("3");

    await attempt1.locator("button").last().click();
    await page.getByText("Save", { exact: true }).click();

    entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 3, grade: "F", approved: true }]);
  });
});
