import { test, expect, Page, Locator } from "@playwright/test";
import { seedProfile, gotoGrades, gotoStatistics, gotoDashboard, gotoForecast } from "./fixtures";

// Acceptance tests for the feedback from Gabi, the ESP program head
// (see ai-context/Gabi-feedback.md for her full messages and screenshots).
// Each describe block below maps to one row of the "Issues to fix" table
// in that document.

// The app renders both a desktop and a mobile DOM tree simultaneously
// (CSS-hidden depending on viewport). .first() picks the desktop one,
// which is always first in DOM order.
function courseCard(page: Page, courseCode: string): Locator {
  return page
    .getByText(courseCode, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .first();
}

async function gradeCard(card: Locator, page: Page, grade: string) {
  const trigger = card.getByRole("button", { name: "—" });
  const wrapper = trigger.locator("..");
  await trigger.click();
  await page.getByTestId("grade-menu").getByRole("button", { name: grade, exact: true }).click();
  await page.waitForTimeout(150);
}

const LEVEL_1_SIDE = ["ESP-101", "ESP-101-M3L1", "ESP-101-M4L1", "ESP-201"];
const LEVEL_2_SIDE = ["ESP-201-M2L2", "ESP-201-M3L2", "ESP-201-M4L2", "ESP-201-M5L2"];

async function expectGradable(page: Page, codes: string[]) {
  for (const code of codes) {
    await expect(courseCard(page, code).getByRole("button", { name: "—" })).toBeVisible();
  }
}

async function expectHidden(page: Page, codes: string[]) {
  for (const code of codes) {
    await expect(page.getByText(code, { exact: true })).toHaveCount(0);
  }
}

test.describe("Gabi feedback #1 — Level 1/2 selector hides the incompatible alternative", () => {
  // Her screenshot showed ESP 1 (Level 1) and Lab M2L2 (Level 2) both
  // gradable at the same time. Only one side of each pair should ever be
  // shown, based on the student's placement level.
  test("Level 1 selected: ESP 1 is gradable, Lab M2L2 is not shown", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await expectGradable(page, ["ESP-101"]);
    await expectHidden(page, ["ESP-201-M2L2"]);
  });

  test("Level 2 selected: Lab M2L2 is gradable, ESP 1 is not shown", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await expectGradable(page, ["ESP-201-M2L2"]);
    await expectHidden(page, ["ESP-101"]);
  });

  test("all four M2-M5 pairs are mutually exclusive by level", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await expectGradable(page, LEVEL_1_SIDE);
    await expectHidden(page, LEVEL_2_SIDE);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await expectGradable(page, LEVEL_2_SIDE);
    await expectHidden(page, LEVEL_1_SIDE);
  });

  test("a Level 2 student gets two columns, without the empty Level 1 column", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    const columnHeaders = page.locator("p", { hasText: /^Level \d$/ }).locator("visible=true");
    await expect(columnHeaders).toHaveText(["Level 1", "Level 2", "Level 3"]);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await expect(columnHeaders).toHaveText(["Level 2", "Level 3"]);
  });

  test("a graded off-level course is hidden and not counted, but its grade is kept for when you switch back", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await gradeCard(courseCard(page, "ESP-101"), page, "A");
    await expect(page.getByText("4.00").first()).toBeVisible();

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await expectHidden(page, LEVEL_1_SIDE);
    await expect(page.getByText("4.00")).toHaveCount(0);
    await expect(page.getByText("0.00").first()).toBeVisible();
    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem("jala-esp-gpa-store")!).state.gradesByCohort["cohort-2-2026"]["ESP-101"],
    );
    expect(stored).toBe("A");

    await page.getByRole("button", { name: "Level 1", exact: true }).first().click();
    await page.waitForTimeout(200);
    await expect(courseCard(page, "ESP-101").getByRole("button", { name: "A", exact: true })).toBeVisible();
    await expect(page.getByText("4.00").first()).toBeVisible();
  });
});

test.describe("Gabi feedback #2 — the untaken alternative is ignored in GPA and progress", () => {
  test("grading only the Level 1 side leaves cumulative GPA at exactly 4.00, not diluted by the Level 2 side", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await gradeCard(courseCard(page, "ESP-101"), page, "A");

    await gotoDashboard(page);
    await expect(page.getByText("4.00").first()).toBeVisible();
  });

  test("the untaken alternative doesn't count toward total courses", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    const text = await page.locator("main").innerText();
    // 6 ESP courses total for a Level 1 student: the Level 2 side of the
    // 4 alternative pairs is excluded, so "Completion" denominator is 6,
    // not more.
    expect(text).toMatch(/of 6 courses|6 of 6 courses|of 6 total/);
  });
});

test.describe("Gabi feedback #3 — labs can't be retaken, only ESP courses can", () => {
  test("a lab graded F records directly, no retake modal, no retake trigger", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const labCard = courseCard(page, "ESP-101-M3L1");
    await expect(labCard.getByTitle("Mark as failed / manage retakes")).toHaveCount(0);

    await labCard.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Did you fail this course?")).toHaveCount(0);
    await expect(labCard.getByRole("button", { name: "F", exact: true })).toBeVisible();
  });

  test("an ESP course graded F opens the retake modal and can be tracked as a retake", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const courseCardLocator = courseCard(page, "ESP-101");
    await expect(courseCardLocator.getByTitle("Mark as failed / manage retakes")).toBeVisible();

    await courseCardLocator.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Did you fail this course?")).toHaveCount(0);
    await expect(page.getByText("Attempt 1")).toBeVisible();
  });
});

test.describe("Gabi feedback #4 — no Credits field in the ESP retake modal", () => {
  test("the retake modal for an ESP course has no Credits input", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await courseCard(page, "ESP-101").getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Grade", { exact: true })).toBeVisible();
    await expect(page.getByText("Passed", { exact: true })).toBeVisible();
    await expect(page.getByText("Credits", { exact: true })).toHaveCount(0);
  });
});

test.describe("Gabi feedback #5 — no Latin honors or Dean's/President's List for ESP", () => {
  test("Dashboard, Statistics and Forecast show none of these for ESP", async ({ page }) => {
    await seedProfile(page, { career: "esp" });

    await gotoDashboard(page);
    for (const text of ["Cum Laude", "Magna", "Summa", "Dean's", "President's"]) {
      await expect(page.getByText(text, { exact: false })).toHaveCount(0);
    }

    await gotoStatistics(page);
    for (const text of ["Cum Laude", "Magna", "Summa", "Dean's", "President's"]) {
      await expect(page.getByText(text, { exact: false })).toHaveCount(0);
    }

    await gotoForecast(page);
    for (const text of ["Cum Laude", "Magna", "Summa", "Dean's", "President's"]) {
      await expect(page.getByText(text, { exact: false })).toHaveCount(0);
    }
  });

  test("Commercial SE still shows Latin honors and Dean's/President's List (unaffected)", async ({
    page,
  }) => {
    await seedProfile(page, { career: "software_engineering_design_architecture" });
    await gotoDashboard(page);
    await expect(page.getByText("Cum Laude", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Dean's List Terms", { exact: false }).first()).toBeVisible();
  });
});

test.describe("Gabi feedback #6 — completion doesn't depend on labs, no bogus 'Not achievable'", () => {
  // Reproduces her exact screenshots: all 6 ESP courses passing, all
  // shared-path labs failing. She expected this to be a complete program.
  test("all courses passing + all labs failing => 100% Completion, Completed ESP Courses 6/6", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const courseGrades: [string, string][] = [
      ["ESP-101", "A"],
      ["ESP-201", "A"],
      ["ESP-301", "A"],
      ["ESP-401", "A"],
      ["ESP-501", "A"],
      ["ESP-601", "A"],
    ];
    const labGrades: [string, string][] = [
      ["ESP-101-M3L1", "F"],
      ["ESP-101-M4L1", "F"],
      ["ESP-201-M6", "F"],
      ["ESP-201-M7", "F"],
      ["ESP-201-M9", "F"],
      ["ESP-201-M10", "F"],
    ];
    for (const [code, grade] of [...courseGrades, ...labGrades]) {
      const card = courseCard(page, code);
      await card.scrollIntoViewIfNeeded();
      await gradeCard(card, page, grade);
    }

    await gotoStatistics(page);
    await page.waitForTimeout(500);
    const statsText = await page.locator("main").innerText();
    expect(statsText).toMatch(/Completion\s*\n\s*100%/);
    expect(statsText).toMatch(/6 of 6 courses/);

    await gotoDashboard(page);
    await page.waitForTimeout(300);
    const dashText = await page.locator("main").innerText();
    expect(dashText).toMatch(/Completed ESP Courses\s*\n\s*6/);
    expect(dashText).toMatch(/Completed ESP Labs\s*\n\s*6\s*\n\s*of 6/);

    // GPA still correctly reflects the failing labs — labs count toward
    // GPA, they just don't block completion.
    expect(dashText).toMatch(/2\.00/);
  });

  test("ESP forecast has no honor-preset targets to trigger a misleading 'Not achievable'", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);
    await expect(page.getByText("Cum Laude", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Magna", { exact: false })).toHaveCount(0);
    await expect(page.getByText("Summa", { exact: false })).toHaveCount(0);
  });

  test("a failed ESP course, never retaken to a pass, correctly does not count as completed", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const card = courseCard(page, "ESP-101");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);

    await gotoStatistics(page);
    await page.waitForTimeout(500);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Total Courses Completed\s*\n\s*0/);
  });
});

test.describe("Gabi feedback #7 — Special Labs are conditional/optional", () => {
  test("an ungraded Special Lab doesn't block completion or count against the student", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    // Special Lab M13 (Level 3) stays ungraded — it's optional but not
    // level-gated, so it stays visible at any placement level, and it
    // shouldn't count toward the ESP completion denominator (type "Lab",
    // not "Core").
    const specialLab = courseCard(page, "ESP-301-M13");
    await expect(specialLab.getByRole("button", { name: "—" })).toBeVisible();

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/of 6 courses|6 of 6 courses|of 6 total/);

    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);
    await expect(courseCard(page, "ESP-301-M13").getByRole("button", { name: "—" })).toBeVisible();
  });
});
