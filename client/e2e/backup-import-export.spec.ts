import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoPlayground, readLocalStorageJson } from "./fixtures";

async function importGradesJson(
  page: import("@playwright/test").Page,
  content: string,
  fileName = "backup.json",
) {
  await page.locator('button[aria-label="Actions"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Import Cohort Backup").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: fileName,
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
}

async function importPlaygroundJson(
  page: import("@playwright/test").Page,
  content: string,
  fileName = "backup.json",
) {
  await page.locator('[data-tour="playground-actions-menu"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator('[data-tour="playground-action-import-backup"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: fileName,
    mimeType: "application/json",
    buffer: Buffer.from(content),
  });
}

test.describe("Grades backup import - edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("malformed JSON shows an invalid-JSON error", async ({ page }) => {
    await importGradesJson(page, "{not valid json,,,");
    await expect(page.getByText("The file does not contain valid JSON.")).toBeVisible();
  });

  test("missing cohortId shows a missing-fields error", async ({ page }) => {
    await importGradesJson(page, JSON.stringify({ grades: { "CSPR-111": "A" } }));
    await expect(
      page.getByText("Required fields are missing. Make sure the file includes cohortId and grades."),
    ).toBeVisible();
  });

  test("unknown cohortId shows a specific error naming the cohort", async ({ page }) => {
    await importGradesJson(
      page,
      JSON.stringify({ cohortId: "cohort-9-9999", grades: { "CSPR-111": "A" } }),
    );
    await expect(page.getByText('Cohort "cohort-9-9999" is not recognized')).toBeVisible();
  });

  test("invalid grade value shows an invalid-grades error", async ({ page }) => {
    await importGradesJson(
      page,
      JSON.stringify({ version: 2, cohortId: "cohort-2-2026", grades: { "CSPR-111": "Z" } }),
    );
    await expect(
      page.getByText("The file contains invalid or unrecognized grade values."),
    ).toBeVisible();
  });

  test("v2 retake (CourseAttempt[]) shape imports correctly", async ({ page }) => {
    const payload = {
      version: 2,
      cohortId: "cohort-2-2026",
      grades: {
        "CSPR-111": [
          { credits: 2, grade: "F", approved: false },
          { credits: 2, grade: "B", approved: true },
        ],
      },
    };
    await importGradesJson(page, JSON.stringify(payload));
    await page.getByRole("button", { name: "Yes, reset it" }).click();

    const store = await readLocalStorageJson<{
      state: { selectedCohortId: string; gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-gpa-store");
    const grades = store!.state.gradesByCohort["cohort-2-2026"];
    expect(grades["CSPR-111"]).toEqual([
      { credits: 2, grade: "F", approved: false },
      { credits: 2, grade: "B", approved: true },
    ]);
  });

  test("canceling the confirm leaves grades untouched", async ({ page }) => {
    await importGradesJson(
      page,
      JSON.stringify({ version: 2, cohortId: "cohort-2-2026", grades: { "CSPR-111": "A" } }),
    );
    await page.getByRole("button", { name: "Cancel" }).click();

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await expect(firstCard.getByRole("button", { name: "—" })).toBeVisible();
  });

  test("export then re-import round trip preserves grades", async ({ page }) => {
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A-", exact: true }).click();

    await page.locator('button[aria-label="Actions"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByText("Export Cohort Backup").click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const fs = await import("fs/promises");
    const exported = await fs.readFile(downloadPath!, "utf-8");

    await page.locator('button[aria-label="Actions"]').click();
    await page.getByText("Reset Data").click();
    await page.getByRole("button", { name: "Reset Cohort" }).click();
    await page.getByRole("button", { name: "Yes, reset it" }).click();
    await expect(page.getByText("A-").first()).toHaveCount(0);

    await importGradesJson(page, exported);
    await page.getByRole("button", { name: "Yes, reset it" }).click();

    const firstCard = page.locator('[data-tour="first-course-card"]');
    await expect(firstCard.getByRole("button", { name: "A-", exact: true })).toBeVisible();
  });
});

test.describe("Playground backup import - edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoPlayground(page);
  });

  test("invalid format (missing course) shows an error", async ({ page }) => {
    await importPlaygroundJson(page, JSON.stringify({ version: 1 }));
    await expect(
      page.getByText("Invalid file format. Make sure you're importing a valid Playground backup file."),
    ).toBeVisible();
  });

  test("malformed JSON shows an error", async ({ page }) => {
    await importPlaygroundJson(page, "{not valid json");
    await expect(
      page.getByText("Invalid file format. Make sure you're importing a valid Playground backup file."),
    ).toBeVisible();
  });

  test("group weights not summing to 100% still import without being blocked", async ({ page }) => {
    const payload = {
      version: 1,
      course: {
        title: "Overweighted Course",
        groups: [
          { id: "g1", name: "Group A", weightPercent: 60 },
          { id: "g2", name: "Group B", weightPercent: 60 },
        ],
        assignments: [
          { id: "a1", groupId: "g1", name: "Task A", score: 10, maxPoints: 10 },
        ],
      },
    };
    await importPlaygroundJson(page, JSON.stringify(payload));
    await page.getByRole("button", { name: "Yes", exact: true }).click();

    await expect(page.getByText("Overweighted Course")).toBeVisible();
    await expect(page.getByText("120%")).toBeVisible();
  });

  test("canceling the confirm leaves the current course untouched", async ({ page }) => {
    const payload = {
      version: 1,
      course: {
        title: "Should Not Apply",
        groups: [{ id: "g1", name: "Group A", weightPercent: 100 }],
        assignments: [],
      },
    };
    await importPlaygroundJson(page, JSON.stringify(payload));
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Untitled Course")).toBeVisible();
    await expect(page.getByText("Should Not Apply")).toHaveCount(0);
  });

  test("export then re-import round trip preserves the course", async ({ page }) => {
    const title = page.locator('[data-tour="playground-title"]').first();
    await title.dblclick();
    const input = page.locator('input[data-tour="playground-title"]');
    await input.fill("Round Trip Course");
    await input.press("Enter");

    await page.locator('[data-tour="playground-actions-menu"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-tour="playground-action-export-backup"]').click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    const fs = await import("fs/promises");
    const exported = await fs.readFile(downloadPath!, "utf-8");

    // "Reset Assignments" only resets assignments/groups, not the title, so
    // switch away from "Round Trip Course" by importing different content
    // first to prove the later re-import genuinely restores the exported state.
    await importPlaygroundJson(
      page,
      JSON.stringify({
        version: 1,
        course: {
          title: "Some Other Course",
          groups: [{ id: "g1", name: "Group A", weightPercent: 100 }],
          assignments: [],
        },
      }),
    );
    await page.getByRole("button", { name: "Yes", exact: true }).click();
    await expect(page.getByText("Some Other Course")).toBeVisible();
    await expect(page.getByText("Round Trip Course")).toHaveCount(0);

    await importPlaygroundJson(page, exported);
    await page.getByRole("button", { name: "Yes", exact: true }).click();

    await expect(page.getByText("Round Trip Course")).toBeVisible();
  });
});
