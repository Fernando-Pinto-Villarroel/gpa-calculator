import path from "path";
import { test, expect, Page, Locator } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard, gotoForecast, gotoStatistics } from "./fixtures";
import { buildEspGradesFromPdfEntries } from "../src/features/config/services/pdfParser";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

function courseCard(page: Page, courseCode: string): Locator {
  return page
    .getByText(courseCode, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .first();
}

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

async function readRemainingCourses(page: Page): Promise<number> {
  const text = await page.locator("main").innerText();
  const match = text.match(/Remaining Courses\s*\n\s*(\d+)/);
  expect(match).not.toBeNull();
  return Number(match![1]);
}

test.describe("SIS PDF import keeps the placement level consistent with the transcript", () => {
  test("an explicit Level 1 is replaced when the imported transcript is clearly Level 2", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", {}, {
      placementLevelByCohort: { "cohort-2-2026": "1" },
    });
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const chooser = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    await (await chooser).setFiles(path.join(TEST_DATA, "irwin.pdf"));
    await page.getByRole("button", { name: "Yes, import grades" }).click({ timeout: 20_000 });

    await expect(page.getByText(/Placement level set to Level 2/)).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "true");

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    expect(await page.locator("main").innerText()).toMatch(/of 4 total/);
  });

  test("a transcript that matches the chosen level leaves it untouched and says nothing", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", {}, {
      placementLevelByCohort: { "cohort-2-2026": "1" },
    });
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const chooser = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    await (await chooser).setFiles(path.join(TEST_DATA, "samuel.pdf"));
    await page.getByRole("button", { name: "Yes, import grades" }).click({ timeout: 20_000 });

    await expect(page.getByText("PDF Imported")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Placement level set to/)).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Level 1", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("SIS PDF import keeps every ESP attempt, like it already does for Commercial SE", () => {
  test("a retaken ESP course becomes a list of attempts in chronological order, approving the pass", () => {
    const result = buildEspGradesFromPdfEntries(
      [
        { courseCode: "ESP-201", credits: 0, grade: "B" },
        { courseCode: "ESP-101", credits: 0, grade: "A" },
        { courseCode: "ESP-201", credits: 0, grade: "F" },
      ],
      "cohort-2-2026",
    );
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.grades["ESP-201"]).toEqual([
      { credits: 0, grade: "F", approved: false },
      { credits: 0, grade: "B", approved: true },
    ]);
    expect(result.grades["ESP-101"]).toBe("A");
  });
});

test.describe("Forecast never plans a fourth attempt", () => {
  test("Commercial SE: a course failed three times is not a remaining course", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);
    await page.waitForTimeout(400);
    const before = await readRemainingCourses(page);

    await seedStore(page, "jala-gpa-store", {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "D-", approved: false },
      ],
    });
    await gotoForecast(page);
    await page.waitForTimeout(400);
    expect(await readRemainingCourses(page)).toBe(before - 1);
  });

  test("ESP: a course failed three times is not a remaining course, one failed twice still is", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);
    await page.waitForTimeout(400);
    const before = await readRemainingCourses(page);

    await seedStore(
      page,
      "jala-esp-gpa-store",
      {
        "ESP-101": [
          { credits: 0, grade: "F", approved: false },
          { credits: 0, grade: "F", approved: false },
          { credits: 0, grade: "F", approved: false },
        ],
        "ESP-201": [
          { credits: 0, grade: "F", approved: false },
          { credits: 0, grade: "F", approved: false },
        ],
      },
      { placementLevelByCohort: {} },
    );
    await gotoForecast(page);
    await page.waitForTimeout(400);
    expect(await readRemainingCourses(page)).toBe(before - 1);
  });
});

test.describe("SAP standing also checks the rate of progress (catalog v5.1: 67%)", () => {
  test("GPA 2.40 but only 60% of credits passed shows SAP Risk with the rate-of-progress reason", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "MATH-111": "A", "CSPR-111": "F" });
    await gotoDashboard(page);

    await expect(page.getByText("2.40").first()).toBeVisible();
    await expect(page.getByText("SAP Risk", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Your rate of progress is 60%/).first()).toBeVisible();
  });

  test("GPA 2.86 with 71% of credits passed shows Academic Risk because of the rate of progress", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "MATH-111": "A", "CSPR-111": "A", "HIST-111": "F" });
    await gotoDashboard(page);

    await expect(page.getByText("2.86").first()).toBeVisible();
    await expect(page.getByText("Academic Risk", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Your rate of progress is 71%/).first()).toBeVisible();
  });

  test("a low GPA keeps the GPA-based message", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "CSPR-111": "C-" });
    await gotoDashboard(page);

    await expect(page.getByText("SAP Risk", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Your GPA is below 2\.00/).first()).toBeVisible();
    await expect(page.getByText(/rate of progress/)).toHaveCount(0);
  });

  test("all courses passed with a good GPA stays in good standing", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "MATH-111": "B", "CSPR-111": "B" });
    await gotoDashboard(page);

    await expect(page.getByText("Good Standing", { exact: true }).first()).toBeVisible();
  });

  test("Statistics 'Projected Honor' agrees with the dashboard", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", { "MATH-111": "A", "CSPR-111": "A", "HIST-111": "F" });
    await gotoStatistics(page);
    await page.waitForTimeout(300);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Projected Honor\s*\n\s*Academic Risk/);
  });
});

test.describe("Switching the placement level warns about grades on the other level", () => {
  test("moving to Level 2 with ESP 1 graded warns that it is kept but no longer counted", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    const card = courseCard(page, "ESP-101");
    await card.getByRole("button", { name: "—" }).click();
    await card.getByRole("button", { name: "A", exact: true }).click();
    await page.waitForTimeout(200);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await expect(page.getByText("Grades from the other level")).toBeVisible();
    await expect(page.getByText(/You have grades on 1 Level 1 course\. They are kept, but hidden/)).toBeVisible();
    await expect(page.getByText("ESP-101", { exact: true })).toHaveCount(0);
  });

  test("switching without grades on the other level shows no warning", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(400);
    await expect(page.getByText("Grades from the other level")).toHaveCount(0);
  });
});

test.describe("ESP dashboard separates completed courses from completed labs", () => {
  test("courses and labs are counted on their own cards", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(
      page,
      "jala-esp-gpa-store",
      {
        "ESP-101": "A",
        "ESP-201": "F",
        "ESP-101-M3L1": "B",
        "ESP-101-M4L1": "F",
        "ESP-201-M6": "C",
        "ESP-301-M13": "A",
      },
      { placementLevelByCohort: {} },
    );
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();

    expect(text).toMatch(/Completed ESP Courses\s*\n\s*1\s*\n\s*\/ 6/);
    expect(text).toMatch(/Completed ESP Labs\s*\n\s*3\s*\n\s*of 7/);
    expect(text).not.toContain("Courses Passed");
    expect(text).not.toContain("Completed Subjects");
  });

  test("Commercial SE keeps its Completed Subjects card", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    await expect(page.getByText("Completed Subjects").first()).toBeVisible();
    await expect(page.getByText("Completed ESP Labs")).toHaveCount(0);
  });
});

test.describe("Grades of the non-selected level never leak into any metric", () => {
  test("a graded ESP 1 left behind after choosing Level 2 is out of GPA, completion, forecast and the grade chart", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(
      page,
      "jala-esp-gpa-store",
      { "ESP-101": "F", "ESP-201-M2L2": "A" },
      { placementLevelByCohort: { "cohort-2-2026": "2" } },
    );

    await gotoDashboard(page);
    const dash = await page.locator("main").innerText();
    expect(dash).toContain("4.00");
    expect(dash).toMatch(/Completed ESP Courses\s*\n\s*0\s*\n\s*\/ 4/);
    expect(dash).not.toMatch(/Lowest Grade\s*\n\s*F/);

    await gotoStatistics(page);
    await page.waitForTimeout(500);
    const stats = await page.locator("main").innerText();
    expect(stats).toMatch(/of 4 total/);
    const distribution = page
      .getByText("Grade Distribution", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
      .first();
    await expect(distribution.locator(".recharts-wrapper").first()).not.toContainText("F");

    await gotoForecast(page);
    await page.waitForTimeout(500);
    const forecast = await page.locator("main").innerText();
    expect(forecast).toContain("4.000");
  });
});

