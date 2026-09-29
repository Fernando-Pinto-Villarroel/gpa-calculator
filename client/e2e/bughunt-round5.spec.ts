import { test, expect, Page } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard, gotoForecast } from "./fixtures";

type Attempt = { credits: number; grade: string | null; approved: boolean };

function seedStore(
  page: Page,
  key: string,
  entries: Record<string, string | Attempt[]>,
  extra: object = {},
) {
  return page.addInitScript(
    ({ key, entries, extra }) => {
      if (sessionStorage.getItem(`seeded-${key}`)) return;
      sessionStorage.setItem(`seeded-${key}`, "1");
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            gradesByCohort: { "cohort-2-2026": entries },
            selectedCohortId: "cohort-2-2026",
            ...extra,
          },
          version: 0,
        }),
      );
    },
    { key, entries, extra },
  );
}

const failedThrice = (credits: number): Attempt[] => [
  { credits, grade: "F", approved: false },
  { credits, grade: "F", approved: false },
  { credits, grade: "D-", approved: false },
];

test.describe("Rate of progress is judged on the same rounded percent it displays", () => {
  test("4 of 6 credits passed shows 67% and Academic Risk, not a contradictory SAP Risk", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "CSPR-111": "A", "HIST-111": "A", "CSOS-112": "F" });
    await gotoDashboard(page);

    await expect(page.getByText("Academic Risk", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("SAP Risk", { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Your rate of progress is 67%/).first()).toBeVisible();
  });
});

test.describe("Grades on both placement levels are flagged instead of silently hidden", () => {
  test("with no level chosen and grades on both sides, a banner asks to pick one", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(
      page,
      "jala-esp-gpa-store",
      { "ESP-101": "A", "ESP-201-M2L2": "B" },
      { placementLevelByCohort: {} },
    );
    await gotoGrades(page);

    await expect(
      page.getByText(/You have grades on both Level 1 and Level 2 courses\. Only Level 1 is counted/),
    ).toBeVisible();

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await expect(page.getByText(/You have grades on both Level 1 and Level 2 courses/)).toHaveCount(0);
  });

  test("grades on only one side show no ambiguity banner", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", { "ESP-201-M2L2": "B" }, { placementLevelByCohort: {} });
    await gotoGrades(page);

    await expect(page.getByText(/Detected Level 2 from your grades/)).toBeVisible();
    await expect(page.getByText(/You have grades on both/)).toHaveCount(0);
  });
});

test.describe("The dashboard flags a course whose three attempts are exhausted", () => {
  test("Commercial SE: three failed attempts show the dismissal alert with the course name", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "CSPR-111": failedThrice(2) });
    await gotoDashboard(page);

    const alert = page.getByRole("alert").filter({ hasText: "Attempts exhausted" }).first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("Programming 1: failed three times");
    await expect(alert).toContainText("dismissal from the program");
  });

  test("ESP: three failed attempts show the ESP dismissal alert", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", { "ESP-101": failedThrice(0) }, { placementLevelByCohort: {} });
    await gotoDashboard(page);

    const alert = page.getByRole("alert").filter({ hasText: "Attempts exhausted" }).first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("dismissal from the ESP certificate program");
  });

  test("two failed attempts, or a pass on the third, show no alert", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", {
      "CSPR-111": failedThrice(2).slice(0, 2),
      "MATH-111": [
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "F", approved: false },
        { credits: 3, grade: "C", approved: true },
      ],
    });
    await gotoDashboard(page);
    await expect(page.getByText("Attempts exhausted")).toHaveCount(0);
  });
});

test.describe("ESP forecast separates remaining courses from remaining labs", () => {
  const passedCourses = { "ESP-201": "A", "ESP-301": "A", "ESP-401": "A", "ESP-501": "A", "ESP-601": "A" };

  function seedEsp(page: Page, cohortId: string, level: "1" | "2", grades: Record<string, string>) {
    return page.addInitScript(
      ({ cohortId, level, grades }) => {
        if (sessionStorage.getItem("seeded-esp-forecast")) return;
        sessionStorage.setItem("seeded-esp-forecast", "1");
        localStorage.setItem(
          "jala-esp-gpa-store",
          JSON.stringify({
            state: {
              gradesByCohort: { [cohortId]: grades },
              selectedCohortId: cohortId,
              placementLevelByCohort: { [cohortId]: level },
            },
            version: 0,
          }),
        );
      },
      { cohortId, level, grades },
    );
  }

  async function cards(page: Page) {
    const text = await page.locator("main").innerText();
    return {
      courses: Number(text.match(/Remaining Courses\s*\n\s*(\d+)/)?.[1]),
      labs: Number(text.match(/Remaining Labs\s*\n\s*(\d+)/)?.[1]),
      text,
    };
  }

  test("cohort I - 2023, Level 1: courses ESP 2-6 passed and no labs graded shows 0 courses and 6 labs that do not block completion", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedEsp(page, "cohort-1-2023", "1", passedCourses);
    await gotoForecast(page);
    await page.waitForTimeout(600);

    const { courses, labs, text } = await cards(page);
    expect(courses).toBe(0);
    expect(labs).toBe(6);
    expect(text).toContain("Mandatory, but non-blocking for completion");
    expect(text).not.toMatch(/optional/i);
  });

  test("cohort I - 2023: one lab left without a grade is one Remaining Lab, never a missing course", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedEsp(page, "cohort-1-2023", "1", {
      ...passedCourses,
      "ESP-101-M3L1": "F",
      "ESP-101-M4L1": "F",
      "ESP-201-M6": "F",
      "ESP-201-M7": "F",
      "ESP-201-M9": "F",
    });
    await gotoForecast(page);
    await page.waitForTimeout(600);

    const { courses, labs } = await cards(page);
    expect(courses).toBe(0);
    expect(labs).toBe(1);
  });

  test("Gabi's scenario: every course passed and every lab of the level failed shows 0 and 0", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEsp(page, "cohort-1-2023", "1", {
      ...passedCourses,
      "ESP-101-M3L1": "F",
      "ESP-101-M4L1": "F",
      "ESP-201-M6": "F",
      "ESP-201-M7": "F",
      "ESP-201-M9": "F",
      "ESP-201-M10": "F",
    });
    await gotoForecast(page);
    await page.waitForTimeout(600);

    const { courses, labs } = await cards(page);
    expect(courses).toBe(0);
    expect(labs).toBe(0);
  });

  test("labs stay in the forecast: scenarios talk about courses and labs together", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEsp(page, "cohort-1-2023", "1", passedCourses);
    await gotoForecast(page);
    await page.waitForTimeout(600);

    await expect(page.getByText(/If all 6 remaining courses and labs get the same grade/)).toBeVisible();
  });

  test("Commercial SE keeps a single Remaining Courses card with its credits", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);
    await page.waitForTimeout(400);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Remaining Courses\s*\n\s*52\s*\(133 cr\)/);
    expect(text).not.toContain("Remaining Labs");
  });
});
