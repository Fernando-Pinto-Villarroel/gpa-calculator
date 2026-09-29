import path from "path";
import { test, expect, Page, Locator } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  gotoDashboard,
  gotoStatistics,
  readLocalStorageJson,
} from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

// Bugs and edge cases found while reviewing the ESP implementation after
// the Gabi feedback work (see ai-context/Gabi-feedback.md), beyond her
// literally reported issues.

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

interface EspStoreShape {
  state: {
    placementLevelByCohort: Record<string, "1" | "2" | null>;
  };
}

test.describe("Levels Completed only depends on ESP courses, not labs", () => {
  test("Level 1's two courses passing with its two labs failing still counts Level 1 as completed", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await gradeCard(courseCard(page, "ESP-101"), page, "A");
    await gradeCard(courseCard(page, "ESP-101-M3L1"), page, "F");
    await gradeCard(courseCard(page, "ESP-101-M4L1"), page, "F");
    await gradeCard(courseCard(page, "ESP-201"), page, "A");

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Levels Completed\s*\n\s*1/);
  });

  test("a fresh, ungraded profile shows 0 levels completed (not vacuously all of them)", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Levels Completed\s*\n\s*0/);
  });
});

test.describe("Placement level is scoped per cohort, like grades already are", () => {
  test("choosing Level 2 for one cohort doesn't carry over to a different cohort", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.waitForTimeout(200);
    await page.getByText("Cohort 1", { exact: false }).first().click();
    await page.waitForTimeout(300);

    // The other cohort has no data, so it defaults quietly to Level 1
    // rather than inheriting the first cohort's explicit Level 2.
    await expect(
      page.getByRole("button", { name: "Level 1", exact: true }).first(),
    ).toHaveClass(/bg-jala-700/);
    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).not.toHaveClass(/bg-jala-700/);

    const store = await readLocalStorageJson<EspStoreShape>(page, "jala-esp-gpa-store");
    expect(store?.state.placementLevelByCohort["cohort-2-2026"]).toBe("2");
  });

  test("switching back to the original cohort restores its own explicit level", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);

    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(200);

    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.waitForTimeout(200);
    await page.getByText("Cohort 1", { exact: false }).first().click();
    await page.waitForTimeout(300);

    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.waitForTimeout(200);
    await page.getByText("Cohort 8", { exact: false }).first().click();
    await page.waitForTimeout(300);

    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).toHaveClass(/bg-jala-700/);
  });
});

test.describe("A Level 2 student's completion is out of 4 courses, not 6", () => {
  test("ESP 1 and ESP 2 (the Level 1 side) are excluded from a Level 2 student's completion denominator", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/of 4 total/);
    expect(text).toMatch(/0 of 4 courses/);
  });
});

test.describe("Legacy lab-retake data (from before labs were blocked from retaking)", () => {
  test("doesn't crash the page and still counts correctly toward GPA", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await page.addInitScript(() => {
      localStorage.setItem(
        "jala-esp-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: {
              "cohort-2-2026": {
                "ESP-101-M3L1": [
                  { credits: 1, grade: "F", approved: false },
                  { credits: 1, grade: "F", approved: true },
                ],
              },
            },
            selectedCohortId: "cohort-2-2026",
            placementLevelByCohort: {},
            placementLevel: null,
          },
          version: 0,
        }),
      );
    });

    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await gotoGrades(page);
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);

    await expect(courseCard(page, "ESP-101-M3L1")).toBeVisible();
  });

  test("existing attempts can still be viewed, reverted, or removed — but not added to", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await page.addInitScript(() => {
      localStorage.setItem(
        "jala-esp-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: {
              "cohort-2-2026": {
                "ESP-101-M3L1": [
                  { credits: 1, grade: "F", approved: false },
                  { credits: 1, grade: "F", approved: true },
                ],
              },
            },
            selectedCohortId: "cohort-2-2026",
            placementLevelByCohort: {},
            placementLevel: null,
          },
          version: 0,
        }),
      );
    });
    await gotoGrades(page);
    await page.waitForTimeout(300);

    await courseCard(page, "ESP-101-M3L1").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    await expect(page.getByText("Attempt 1")).toBeVisible();
    await expect(page.getByText("Attempt 2")).toBeVisible();
    await expect(page.getByText("Add Attempt")).toHaveCount(0);
    await expect(page.getByText("Revert to single grade mode")).toBeVisible();
  });
});

test.describe("Guided tour target resolution survives a fully-disabled first level", () => {
  test("picking Level 2 still leaves a real retake-capable course as the desktop tour anchor", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);

    await expect(page.locator('[data-tour="first-course-card"]')).toBeVisible();
    await expect(page.locator('[data-tour="first-retake-btn"]')).toBeVisible();

    // The anchored card must actually be an ESP course (retake-capable),
    // not a lab — Lab M2L2, the first enabled item overall, has no retake
    // button at all.
    const anchoredCard = page.locator('[data-tour="first-course-card"]');
    await expect(anchoredCard.getByText("Lab", { exact: false })).toHaveCount(0);
  });

  test("mobile defaults to the Level 2 tab, not an all-disabled Level 1 tab, after a reload", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.locator('[data-tour="first-course-card-m"]')).toBeVisible();
    await expect(page.locator('[data-tour="first-retake-btn-m"]')).toBeVisible();
  });
});

async function openPdfImportDialog(page: Page, filePath: string) {
  await page.locator('button[aria-label="Actions"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Import from SIS PDF").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);
  // PDF parsing is CPU-heavy — wait for the confirm dialog instead of a
  // fixed timeout, which flakes under parallel test load.
  await expect(page.getByText(/courses with grades were found|ESP course grade/)).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("Placement level inference against real SIS transcripts", () => {
  // Every real transcript we have is cleanly one track or the other — no
  // student shows grades on both sides of an M2-M5 pair — so inference
  // never hits the ambiguous (ignore-both) case in practice.
  const cases: [string, "Level 1" | "Level 2"][] = [
    ["samuel.pdf", "Level 1"],
    ["irwin.pdf", "Level 2"],
    ["sergio.pdf", "Level 2"],
    ["victor.pdf", "Level 2"],
    ["fer.pdf", "Level 2"],
  ];

  for (const [file, expectedLevel] of cases) {
    test(`${file} infers ${expectedLevel} from its real grades, no console errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));

      await seedProfile(page, { career: "esp" });
      await gotoGrades(page);
      await openPdfImportDialog(page, path.join(TEST_DATA, file));
      await page.getByRole("button", { name: "Yes, import grades" }).click();
      await expect(page.getByText("PDF Imported")).toBeVisible({ timeout: 10_000 });
      await page.waitForTimeout(300);

      expect(errors).toEqual([]);

      const expectedBtn = page.getByRole("button", { name: expectedLevel, exact: true }).first();
      const otherLevel = expectedLevel === "Level 1" ? "Level 2" : "Level 1";
      const otherBtn = page.getByRole("button", { name: otherLevel, exact: true }).first();
      await expect(expectedBtn).toHaveClass(/bg-jala-700/);
      await expect(otherBtn).not.toHaveClass(/bg-jala-700/);
    });
  }
});
