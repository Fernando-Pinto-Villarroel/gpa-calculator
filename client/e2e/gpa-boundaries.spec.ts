import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard } from "./fixtures";

// Grading every course in Term I with the SAME letter grade produces an
// overall cumulative GPA EXACTLY equal to that letter's point value
// (regardless of per-course credit weighting), since quality points and
// attempted credits scale together. This lets us hit each honor threshold
// precisely instead of guessing at mixed-grade combinations.
async function gradeAllVisibleWith(page: import("@playwright/test").Page, grade: string) {
  let remaining = await page.getByRole("button", { name: "—" }).count();
  while (remaining > 0) {
    const trigger = page.getByRole("button", { name: "—" }).first();
    const wrapper = trigger.locator("..");
    await trigger.click();
    await wrapper.getByRole("button", { name: grade, exact: true }).click();
    if (grade === "F" || grade === "D-") {
      await page.getByText("No, keep single grade").click();
    }
    await page.waitForTimeout(200);
    remaining = await page.getByRole("button", { name: "—" }).count();
  }
}

const BOUNDARIES: { grade: string; expectedGpa: string; label: string }[] = [
  { grade: "A", expectedGpa: "4.00", label: "Summa Cum Laude" },
  { grade: "A-", expectedGpa: "3.70", label: "Magna Cum Laude" },
  { grade: "B+", expectedGpa: "3.30", label: "Cum Laude" },
  { grade: "B", expectedGpa: "3.00", label: "Good Standing" },
  { grade: "C+", expectedGpa: "2.30", label: "Academic Risk" },
  { grade: "C", expectedGpa: "2.00", label: "Academic Risk" },
  { grade: "C-", expectedGpa: "1.70", label: "SAP Risk" },
  { grade: "F", expectedGpa: "0.00", label: "SAP Risk" },
];

test.describe("Cumulative GPA honor status - exact boundaries", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  for (const { grade, expectedGpa, label } of BOUNDARIES) {
    test(`uniform grade ${grade} (GPA ${expectedGpa}) shows "${label}"`, async ({ page }) => {
      await gradeAllVisibleWith(page, grade);
      await gotoDashboard(page);

      const mainText = await page.locator("main").innerText();
      expect(mainText).toContain(expectedGpa);
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    });
  }

  test("a fresh, ungraded profile shows no honor badge and 'No grades entered yet'", async ({
    page,
  }) => {
    await gotoDashboard(page);
    await expect(page.getByText("No grades entered yet").first()).toBeVisible();
    // "Cum Laude" alone is excluded here: the always-visible threshold
    // legend also uses that exact short label (distinct from the badge's
    // full "Summa/Magna Cum Laude" text), so it isn't a reliable signal
    // for whether the honor badge itself is rendered.
    const unambiguousLabels = ["Summa Cum Laude", "Magna Cum Laude", "Good Standing", "Academic Risk", "SAP Risk"];
    for (const label of unambiguousLabels) {
      await expect(page.getByText(label, { exact: true })).toHaveCount(0);
    }
  });
});

test.describe("Cumulative GPA honor status - ESP parity", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
  });

  test("failing every ESP Level 1 course shows SAP Risk, not 'No grades entered yet'", async ({
    page,
  }) => {
    for (let i = 0; i < 4; i++) {
      const trigger = page.getByRole("button", { name: "—" }).first();
      const wrapper = trigger.locator("..");
      await trigger.click();
      await wrapper.getByRole("button", { name: "F", exact: true }).click();
      await page.getByText("No, keep single grade").click();
      await page.waitForTimeout(150);
    }
    await gotoDashboard(page);

    const mainText = await page.locator("main").innerText();
    expect(mainText).not.toContain("No grades entered yet");
    await expect(page.getByText("SAP Risk", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Your GPA is below 2\.00/).first()).toBeVisible();
  });
});
