import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard } from "./fixtures";

// getBestAndWorstCourses() uses getEffectiveGrade(), which prefers the
// approved attempt over any other attempt in a course's retake history.
// This confirms the Dashboard's Best/Lowest Grade stats reflect that —
// a course retaken from F to an approved A should count as an "A" for
// Best Grade, not surface the buried F attempt as the Lowest Grade.
test.describe("Dashboard Best/Lowest Grade stats respect retake approval", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("a course retaken from F to an approved A counts as A, not F", async ({ page }) => {
    // First course: fail it, then retake and approve an A.
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.getByText("Yes, mark as retaken").click();
    await page.getByText("Add Attempt").click();

    const attempt2 = page.getByText("Attempt 2", { exact: true }).locator("../..");
    await attempt2.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await attempt2.locator("button").last().click();
    await page.getByText("Save", { exact: true }).click();

    // Second course: a single, unambiguous D grade — genuinely the worst.
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "D", exact: true }).click();

    await gotoDashboard(page);
    const mainText = await page.locator("main").innerText();

    expect(mainText).toMatch(/Best Grade\s*\nA/);
    expect(mainText).toMatch(/Lowest Grade\s*\nD/);
    expect(mainText).not.toMatch(/Lowest Grade\s*\nF/);
  });
});
