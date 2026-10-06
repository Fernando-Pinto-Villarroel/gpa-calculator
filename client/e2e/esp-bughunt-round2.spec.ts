import { test, expect, Page, Locator } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  gotoDashboard,
  gotoForecast,
  gotoStatistics,
  switchCareer,
} from "./fixtures";

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
  await wrapper.getByRole("button", { name: grade, exact: true }).click();
  await page.waitForTimeout(150);
}

async function readRemainingLabs(page: Page): Promise<number> {
  const text = await page.locator("main").innerText();
  const match = text.match(/Remaining Labs\s*\n\s*(\d+)/);
  expect(match, "Remaining Labs value should be rendered").not.toBeNull();
  return Number(match![1]);
}

async function readRemainingCourses(page: Page): Promise<number> {
  const text = await page.locator("main").innerText();
  const match = text.match(/Remaining Courses\s*\n\s*(\d+)/);
  expect(match, "Remaining Courses value should be rendered").not.toBeNull();
  return Number(match![1]);
}

async function importJson(page: Page, content: string) {
  await page.locator('button[aria-label="Actions"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Import Cohort Backup").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
}

function seedEspAttempts(
  page: Page,
  attemptsByCourse: Record<string, { credits: number; grade: string | null; approved: boolean }[]>,
) {
  return page.addInitScript((attempts) => {
    localStorage.setItem(
      "jala-esp-gpa-store",
      JSON.stringify({
        state: {
          gradesByCohort: { "cohort-2-2026": attempts },
          selectedCohortId: "cohort-2-2026",
          placementLevelByCohort: {},
          placementLevel: null,
        },
        version: 0,
      }),
    );
  }, attemptsByCourse);
}

test.describe("Forecast treats graded labs as settled, since labs can't be retaken", () => {
  test("Gabi's scenario — 6 courses passed, every shared lab failed — leaves 0 remaining courses and no 'Not achievable'", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const grades: [string, string][] = [
      ["ESP-101", "A"],
      ["ESP-201", "A"],
      ["ESP-301", "A"],
      ["ESP-401", "A"],
      ["ESP-501", "A"],
      ["ESP-601", "A"],
      ["ESP-101-M3L1", "F"],
      ["ESP-101-M4L1", "F"],
      ["ESP-201-M6", "F"],
      ["ESP-201-M7", "F"],
      ["ESP-201-M9", "F"],
      ["ESP-201-M10", "F"],
    ];
    for (const [code, grade] of grades) {
      const card = courseCard(page, code);
      await card.scrollIntoViewIfNeeded();
      await gradeCard(card, page, grade);
    }

    await gotoForecast(page);
    await page.waitForTimeout(600);

    expect(await readRemainingCourses(page)).toBe(0);
    await expect(page.getByText(/Not achievable/)).toHaveCount(0);
  });

  test("grading a lab removes it from Remaining Labs and never changes Remaining Courses", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);
    await page.waitForTimeout(400);
    const coursesBefore = await readRemainingCourses(page);
    const labsBefore = await readRemainingLabs(page);

    await gotoGrades(page);
    await gradeCard(courseCard(page, "ESP-101-M3L1"), page, "F");

    await gotoForecast(page);
    await page.waitForTimeout(400);
    expect(await readRemainingLabs(page)).toBe(labsBefore - 1);
    expect(await readRemainingCourses(page)).toBe(coursesBefore);
  });

  test("a failed ESP course with only failing attempts is still remaining, since courses can be retaken", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);
    await page.waitForTimeout(400);
    const before = await readRemainingCourses(page);

    await seedEspAttempts(page, {
      "ESP-101": [
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "F", approved: false },
      ],
    });
    await gotoForecast(page);
    await page.waitForTimeout(400);
    expect(await readRemainingCourses(page)).toBe(before);
  });
});

test.describe("Levels Completed total follows the student's placement level", () => {
  test("a fresh Level 2 profile shows 0 levels completed out of 2, not 3", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Levels Completed[\s\S]{0,40}of 2/);
    expect(text).not.toMatch(/Levels Completed[\s\S]{0,40}of 3/);
  });

  test("a fresh Level 1 profile shows 0 levels completed out of 3", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Levels Completed[\s\S]{0,40}of 3/);
  });
});

test.describe("Course Completion chart ignores labs, matching the Completion card", () => {
  test("Level 1 with both courses passed and both labs failed hovers as 2 / 2", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await gradeCard(courseCard(page, "ESP-101"), page, "A");
    await gradeCard(courseCard(page, "ESP-201"), page, "A");
    await gradeCard(courseCard(page, "ESP-101-M3L1"), page, "F");
    await gradeCard(courseCard(page, "ESP-101-M4L1"), page, "F");

    await gotoStatistics(page);
    await page.waitForTimeout(800);

    const chartCard = page
      .getByText("Course Completion", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
      .first();
    await chartCard.scrollIntoViewIfNeeded();
    const wrapper = chartCard.locator(".recharts-wrapper").first();
    const box = await wrapper.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + box!.height * 0.5);
    await page.waitForTimeout(300);

    await expect(chartCard.getByText("2 / 2")).toBeVisible();
  });
});

test.describe("Importing an ESP backup from the Commercial SE screen keeps its placement level", () => {
  test("placementLevel in the file is applied even when imported while Commercial SE is active", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    await importJson(
      page,
      JSON.stringify({
        cohortId: "cohort-2-2026",
        placementLevel: "2",
        grades: { "ESP-201-M2L2": "A", "ESP-201-M3L2": "B" },
      }),
    );
    await page.getByRole("button", { name: "Yes, reset it" }).click();
    await page.waitForTimeout(500);

    await switchCareer(page, "esp");
    await gotoGrades(page);

    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).toHaveClass(/bg-jala-700/);
  });

  test("a backup without a placementLevel leaves the existing choice untouched", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await importJson(
      page,
      JSON.stringify({
        cohortId: "cohort-2-2026",
        grades: { "ESP-201-M2L2": "A" },
      }),
    );
    await page.getByRole("button", { name: "Yes, reset it" }).click();
    await page.waitForTimeout(500);

    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).toHaveClass(/bg-jala-700/);
  });
});

test.describe("ESP courses have no credits to override", () => {
  test("double-clicking an ESP course card shows no credit editor", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const card = courseCard(page, "ESP-101");
    await card.dblclick();
    await page.waitForTimeout(200);
    await expect(card.locator('input[type="number"]')).toHaveCount(0);
    await expect(page.getByText(/Overriding credits is an exceptional case/)).toHaveCount(0);
  });

  test("the retake modal for an ESP course hides the Credits input", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await courseCard(page, "ESP-101").getByTitle("Mark as failed / manage retakes").click();
    await page.getByRole("button", { name: "Yes, mark as retaken" }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Attempt 1")).toBeVisible();
    await expect(page.getByText("Credits", { exact: true })).toHaveCount(0);
  });
});

test.describe("Mobile level tab follows the placement level", () => {
  test("switching to Level 2 on mobile moves the tab to Level 2 without a reload", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-tour="first-course-card-m"]')).toBeVisible();
    await expect(page.getByText("ESP-201-M2L2", { exact: true }).last()).toBeVisible();
  });
});

test.describe("ESP has no SAP or projected-honor standing", () => {
  test("a failing ESP GPA shows no SAP Risk badge, alert, or Projected Honor card", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await gradeCard(courseCard(page, "ESP-101-M3L1"), page, "F");

    await gotoDashboard(page);
    await expect(page.getByText("SAP Risk", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Satisfactory Academic Progress/)).toHaveCount(0);

    await gotoStatistics(page);
    await page.waitForTimeout(400);
    await expect(page.getByText("Projected Honor")).toHaveCount(0);
    await expect(page.getByText("Min 2.0")).toHaveCount(0);
  });

  test("Commercial SE still shows its academic standing badge", async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await courseCard(page, "CSPR-111").getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);
    await gotoDashboard(page);
    await expect(page.getByText("SAP Risk", { exact: true }).first()).toBeVisible();
  });
});

test.describe("ESP courses cap at three attempts, per the student catalog", () => {
  test("two failed attempts warn that the next failure means dismissal", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEspAttempts(page, {
      "ESP-101": [
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "F", approved: false },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "ESP-101").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/already has 2 failed attempts/)).toBeVisible();
    await expect(page.getByText(/dismissal from the ESP certificate program and, concurrently, from your Software Engineering degree program/)).toBeVisible();
    await expect(page.getByText("Add Attempt")).toBeVisible();
  });

  test("three failed attempts show the dismissal warning and remove Add Attempt", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEspAttempts(page, {
      "ESP-101": [
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "D-", approved: false },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "ESP-101").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/dismissal from the ESP certificate program/).first()).toBeVisible();
    await expect(page.getByText(/concurrently, from your Software Engineering degree program/).first()).toBeVisible();
    await expect(page.getByText("Add Attempt")).toHaveCount(0);
  });

  test("a course passed on the third attempt shows no dismissal warning", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEspAttempts(page, {
      "ESP-101": [
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "F", approved: false },
        { credits: 1, grade: "B", approved: true },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "ESP-101").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/dismissal from the ESP certificate program/)).toHaveCount(0);
  });
});

function seedCommercialAttempts(
  page: Page,
  attemptsByCourse: Record<string, { credits: number; grade: string | null; approved: boolean }[]>,
) {
  return page.addInitScript((attempts) => {
    localStorage.setItem(
      "jala-gpa-store",
      JSON.stringify({
        state: {
          gradesByCohort: { "cohort-2-2026": attempts },
          selectedCohortId: "cohort-2-2026",
        },
        version: 0,
      }),
    );
  }, attemptsByCourse);
}

test.describe("Commercial SE courses cap at three attempts too, per the student catalog", () => {
  test("two failed attempts warn that the next failure means dismissal from the program", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedCommercialAttempts(page, {
      "CSPR-111": [
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "D-", approved: false },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "CSPR-111").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/already has 2 failed attempts/)).toBeVisible();
    await expect(page.getByText(/dismissal from the program/)).toBeVisible();
    await expect(page.getByText(/ESP certificate program/)).toHaveCount(0);
    await expect(page.getByText("Add Attempt")).toBeVisible();
  });

  test("three failed attempts show the dismissal warning and remove Add Attempt", async ({ page }) => {
    await seedProfile(page);
    await seedCommercialAttempts(page, {
      "CSPR-111": [
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "F", approved: false },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "CSPR-111").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/Three failed attempts/)).toBeVisible();
    await expect(page.getByText("Add Attempt")).toHaveCount(0);
  });

  test("a course passed on the third attempt shows no warning and no Add Attempt", async ({ page }) => {
    await seedProfile(page);
    await seedCommercialAttempts(page, {
      "CSPR-111": [
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "B", approved: true },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "CSPR-111").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText(/failed attempts/)).toHaveCount(0);
    await expect(page.getByText("Add Attempt")).toHaveCount(0);
  });

  test("the first and second attempts can still be added freely", async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const card = courseCard(page, "CSPR-111");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Add Attempt")).toBeVisible();
    await page.getByText("Add Attempt").click();
    await expect(page.getByText("Attempt 2")).toBeVisible();
  });
});

test.describe("Screens beyond Grades also drop the level a Level 2 student never takes", () => {
  async function chartCardByTitle(page: Page, title: string): Promise<Locator> {
    const card = page
      .getByText(title, { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
      .first();
    await card.scrollIntoViewIfNeeded();
    return card;
  }

  test("Level 2 statistics charts drop the empty Level 1", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);
    await gradeCard(courseCard(page, "ESP-201-M2L2"), page, "A");

    await gotoStatistics(page);
    await page.waitForTimeout(800);

    for (const title of ["Cumulative GPA Progression", "Levels GPA Progression"]) {
      const chart = (await chartCardByTitle(page, title)).locator(".recharts-wrapper").first();
      await expect(chart).toContainText("Level 2");
      await expect(chart).not.toContainText("Level 1");
    }

    const completion = (await chartCardByTitle(page, "Course Completion"))
      .locator(".recharts-wrapper")
      .first();
    await expect(completion).toContainText("Level 2");
    await expect(completion).toContainText("Level 3");
    await expect(completion).not.toContainText("Level 1");
  });

  test("Level 1 Course Completion chart keeps all three levels on its axis", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await gradeCard(courseCard(page, "ESP-101"), page, "A");

    await gotoStatistics(page);
    await page.waitForTimeout(800);

    const completion = (await chartCardByTitle(page, "Course Completion"))
      .locator(".recharts-wrapper")
      .first();
    for (const level of ["Level 1", "Level 2", "Level 3"]) {
      await expect(completion).toContainText(level);
    }
  });

  test("Level 2 forecast term selector offers only Level 2 and Level 3", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await gotoForecast(page);
    await page.getByRole("button", { name: "Level", exact: true }).first().click();
    const options = page.locator("select option");
    await expect(options).toHaveText(["Level 2", "Level 3"]);
  });
});

test.describe("Level selector accessibility", () => {
  test("exposes a labelled group and reflects the selection through aria-pressed", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const group = page.getByRole("group", { name: "Placement level" }).first();
    await expect(group).toBeVisible();

    const level1 = group.getByRole("button", { name: "Level 1", exact: true });
    const level2 = group.getByRole("button", { name: "Level 2", exact: true });
    await expect(level1).toHaveAttribute("aria-pressed", "true");
    await expect(level2).toHaveAttribute("aria-pressed", "false");

    await level2.click();
    await expect(level2).toHaveAttribute("aria-pressed", "true");
    await expect(level1).toHaveAttribute("aria-pressed", "false");
  });
});
