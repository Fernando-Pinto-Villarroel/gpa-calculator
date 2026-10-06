import { test, expect, Page, Locator } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  gotoDashboard,
  gotoForecast,
  gotoAbout,
  gotoStatistics,
} from "./fixtures";

function courseCard(page: Page, courseCode: string): Locator {
  return page
    .getByText(courseCode, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .first();
}

type Attempt = { credits: number; grade: string | null; approved: boolean };

function seedGrades(page: Page, key: string, entries: Record<string, string | Attempt[]>, extra: object = {}) {
  return page.addInitScript(
    ({ key, entries, extra }) => {
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

const ESP_EXTRA = { placementLevelByCohort: {}, placementLevel: null };

test.describe("A failing grade never counts as passed", () => {
  test("Commercial SE: credits can still be edited on a failed course, and it does not count as completed", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const card = courseCard(page, "CSPR-111");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();
    await page.waitForTimeout(300);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(300);

    await card.getByText(/^\d cr$/).first().dblclick();
    const input = card.locator('input[type="number"]');
    await expect(input).toBeVisible();
    await input.fill("1");
    await input.press("Enter");
    await expect(card.getByText("1 cr *")).toBeVisible();

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0/);
    expect(text).toContain("0.00");
  });

  test("Commercial SE: legacy data stored as an approved F does not count as a completed subject", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, "jala-gpa-store", {
      "CSPR-111": [{ credits: 1, grade: "F", approved: true }],
    });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0/);
  });

  test("ESP: legacy data stored as an approved F does not count toward Completed ESP Courses or Completion", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await seedGrades(
      page,
      "jala-esp-gpa-store",
      { "ESP-101": [{ credits: 1, grade: "F", approved: true }] },
      ESP_EXTRA,
    );
    await gotoDashboard(page);
    const dash = await page.locator("main").innerText();
    expect(dash).toMatch(/Completed ESP Courses\s*\n\s*0/);

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    const stats = await page.locator("main").innerText();
    expect(stats).toMatch(/Completion\s*\n\s*0%/);
  });

  test("retake modal: the Passed toggle is disabled for a failing grade", async ({ page }) => {
    await seedProfile(page);
    await seedGrades(page, "jala-gpa-store", {
      "CSPR-111": [{ credits: 2, grade: "F", approved: false }],
    });
    await gotoGrades(page);

    await courseCard(page, "CSPR-111").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    const passedToggle = page.getByTitle("An F can't be marked as passed.");
    await expect(passedToggle).toBeDisabled();
  });

  test("retake modal: switching an approved attempt to a failing grade clears its approval", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, "jala-gpa-store", {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "B", approved: true },
      ],
    });
    await gotoGrades(page);

    await courseCard(page, "CSPR-111").getByTitle("Mark as failed / manage retakes").click();
    await page.waitForTimeout(300);

    const dialog = page.locator("div.fixed.inset-0").last();
    await dialog.locator("button", { hasText: "B" }).click();
    await page.getByRole("button", { name: "F", exact: true }).last().click();
    await page.waitForTimeout(200);

    await expect(page.getByTitle("An F can't be marked as passed.")).toHaveCount(2);
    await expect(page.getByText(/already has 2 failed attempts/)).toBeVisible();
  });
});

test.describe("Forecast configuration doesn't leak a term from another career", () => {
  test("a leftover ESP term id falls back to the Commercial SE current term", async ({ page }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      localStorage.setItem(
        "forecast-config",
        JSON.stringify({
          scope: "term",
          termId: "level-2",
          targetGpa: "3.5",
          allowedGrades: ["A", "B"],
          maxCombinations: 3,
        }),
      );
    });
    await gotoForecast(page);
    await page.waitForTimeout(600);

    const text = await page.locator("main").innerText();
    expect(text).not.toContain("All courses in this term have been graded");
    await expect(page.locator("select").first()).toHaveValue("term-1");
  });

  test("a leftover Commercial SE term id falls back to the first ESP level shown", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await page.addInitScript(() => {
      localStorage.setItem(
        "forecast-config",
        JSON.stringify({
          scope: "term",
          termId: "term-3",
          targetGpa: "3.5",
          allowedGrades: ["A", "B"],
          maxCombinations: 3,
        }),
      );
    });
    await gotoForecast(page);
    await page.waitForTimeout(600);

    const text = await page.locator("main").innerText();
    expect(text).not.toContain("All courses in this term have been graded");
    await expect(page.locator("select").first()).toHaveValue("level-1");
  });
});

test.describe("About page follows the selected career", () => {
  test("ESP shows its levels-and-rules section instead of the Latin honors and Dean's List", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    await expect(page.getByText("ESP Levels & Rules")).toBeVisible();
    await expect(page.getByText(/Grades you entered for the other level are kept/)).toBeVisible();
    await expect(page.getByText(/dismissal from the ESP program/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Academic Honors" })).toHaveCount(0);
    await expect(page.getByText(/Summa Cum Laude/)).toHaveCount(0);
  });

  test("Commercial SE keeps its Academic Honors and has no ESP rules section", async ({ page }) => {
    await seedProfile(page);
    await gotoAbout(page);

    await expect(page.getByRole("heading", { name: "Academic Honors" })).toBeVisible();
    await expect(page.getByText(/Summa Cum Laude/)).toBeVisible();
    await expect(page.getByText("ESP Levels & Rules")).toHaveCount(0);
  });

  test("the ESP rules section is translated", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page, "es");
    await expect(page.getByText("Niveles y Reglas de ESP")).toBeVisible();

    await gotoAbout(page, "pt");
    await expect(page.getByText("Níveis e Regras do ESP")).toBeVisible();
  });
});

test.describe("Statistics 'Projected Honor' is localized", () => {
  test("Spanish shows the translated academic standing, not the English label", async ({ page }) => {
    await seedProfile(page);
    await seedGrades(page, "jala-gpa-store", { "CSPR-111": "B-" });
    await page.goto("/es/statistics", { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    await expect(page.getByText("Buen Rendimiento")).toBeVisible();
    await expect(page.getByText("Good Standing")).toHaveCount(0);
  });
});

test.describe("ESP cards have no credits", () => {
  test("no credits badge is shown on any ESP card", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await expect(page.getByText(/^\d+ cr$/)).toHaveCount(0);
  });

  test("Commercial SE cards still show their credits badge", async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await expect(page.locator('[data-tour="first-credits-badge"]')).toBeVisible();
  });
});

test.describe("ESP guided tour", () => {
  async function startEspTourAt(page: Page, index: number) {
    await page.addInitScript((globalStepIndex) => {
      localStorage.setItem(
        "jala-gpa-tour",
        JSON.stringify({ state: { guidedTourCompleted: false, globalStepIndex }, version: 0 }),
      );
      localStorage.setItem(
        "jala-career-store",
        JSON.stringify({ state: { selectedCareerId: "esp" }, version: 0 }),
      );
    }, index);
    await page.goto("/en/grades", { waitUntil: "networkidle" });
  }

  test("explains the placement level selector", async ({ page }) => {
    await startEspTourAt(page, 10);
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Placement Level", { exact: true })).toBeVisible();
    await expect(page.locator('[data-tour="esp-level-selector"]')).toBeVisible();
  });

  test("the retake step describes the ESP rules, not credits", async ({ page }) => {
    await startEspTourAt(page, 12);
    await expect(page.locator('[data-testid="tour-next-button"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/failing it three times means dismissal from the ESP program/)).toBeVisible();
    await expect(page.getByText(/its own grade and credits/)).toHaveCount(0);
  });

  test("the tour language button is labelled in the page language", async ({
    page,
  }) => {
    await seedProfile(page, { tourCompleted: false, career: "esp" });
    await gotoDashboard(page, "es");
    await page.waitForTimeout(1200);

    await expect(page.locator('[data-testid="tour-locale-select"]')).toHaveAttribute(
      "aria-label",
      "Idioma",
    );
  });
});
