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

test.describe("Credit override interacting with grade selection", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("overriding credits then picking a passing grade saves directly, without opening the retake modal", async ({
    page,
  }) => {
    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    const creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("3");
    await creditInput.blur();
    await expect(badge).toContainText("3 cr");

    await page.locator('[data-tour="first-course-card"]').getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "B", exact: true }).click();

    await expect(page.getByText("Did you fail this course?")).toHaveCount(0);

    const card = page.locator('[data-tour="first-course-card"]');
    await expect(card).toContainText("B");
    await expect(card).toContainText("3 cr");

    const entry = (await readFirstCourseEntry(page)) as StoredAttempt[];
    expect(entry).toEqual([{ credits: 3, grade: "B", approved: true }]);
  });

  test("changing credits on a course that already has a plain grade converts it to a credit override directly", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-course-card"]').getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    let entry = await readFirstCourseEntry(page);
    expect(entry).toBe("A");

    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    const creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("4");
    await creditInput.blur();

    const card = page.locator('[data-tour="first-course-card"]');
    await expect(card).toContainText("A");
    await expect(card).toContainText("4 cr");

    entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 4, grade: "A", approved: true }]);
  });

  test("changing credits back to the course's default reverts the override to a plain grade", async ({
    page,
  }) => {
    await page.locator('[data-tour="first-course-card"]').getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    let creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("4");
    await creditInput.blur();

    let entry = await readFirstCourseEntry(page);
    expect(entry).toEqual([{ credits: 4, grade: "A", approved: true }]);

    await badge.dblclick();
    creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("2");
    await creditInput.blur();

    entry = await readFirstCourseEntry(page);
    expect(entry).toBe("A");
    await expect(page.locator('[data-tour="first-credits-badge"]')).not.toContainText("*");
  });
});
