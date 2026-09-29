import { test, expect, Page } from "@playwright/test";
import { seedProfile, gotoForecast, gotoStatistics, gotoDashboard, gotoGrades } from "./fixtures";

type Locale = "en" | "es" | "pt";

const TERM_WORDS: Record<Locale, RegExp> = {
  en: /\bterms?\b/i,
  es: /semestre|t[ée]rmino/i,
  pt: /semestre|per[ií]odo|termo/i,
};

const LEVEL_GPA: Record<Locale, string> = {
  en: "Level GPA",
  es: "GPA del Nivel",
  pt: "GPA do Nível",
};

const TERM_SCOPE_BUTTON: Record<Locale, string> = { en: "Term", es: "Semestre", pt: "Semestre" };
const LEVEL_SCOPE_BUTTON: Record<Locale, string> = { en: "Level", es: "Nivel", pt: "Nível" };

function seedEspGrades(page: Page) {
  return page.addInitScript(() => {
    if (sessionStorage.getItem("seeded-esp-wording")) return;
    sessionStorage.setItem("seeded-esp-wording", "1");
    localStorage.setItem(
      "jala-esp-gpa-store",
      JSON.stringify({
        state: {
          gradesByCohort: { "cohort-2-2026": { "ESP-101": "A", "ESP-101-M3L1": "B", "ESP-201": "C" } },
          selectedCohortId: "cohort-2-2026",
          placementLevelByCohort: {},
        },
        version: 0,
      }),
    );
  });
}

async function termLines(page: Page, locale: Locale) {
  const text = await page.locator("main").innerText();
  return text.split("\n").map((l) => l.trim()).filter((l) => TERM_WORDS[locale].test(l));
}

for (const locale of ["en", "es", "pt"] as const) {
  test.describe(`ESP talks about levels, never terms (${locale})`, () => {
    test("statistics chart legend and tooltip say Level GPA", async ({ page }) => {
      await seedProfile(page, { career: "esp", locale });
      await seedEspGrades(page);
      await page.goto(`/${locale}/statistics`, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);

      const legend = await page.locator(".recharts-legend-item-text").allInnerTexts();
      expect(legend).toContain(LEVEL_GPA[locale]);
      expect(legend.filter((l) => TERM_WORDS[locale].test(l))).toEqual([]);

      const box = await page.locator(".recharts-wrapper").nth(1).boundingBox();
      await page.mouse.move(box!.x + box!.width * 0.3, box!.y + box!.height * 0.5);
      await page.waitForTimeout(400);
      expect(await termLines(page, locale)).toEqual([]);
    });

    test("forecast scope, GPA card and scenarios say Level", async ({ page }) => {
      await seedProfile(page, { career: "esp", locale });
      await seedEspGrades(page);
      await page.goto(`/${locale}/forecast`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);

      await expect(page.getByRole("button", { name: LEVEL_SCOPE_BUTTON[locale], exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: TERM_SCOPE_BUTTON[locale], exact: true })).toHaveCount(0);

      await page.getByRole("button", { name: LEVEL_SCOPE_BUTTON[locale], exact: true }).click();
      await page.waitForTimeout(500);
      await expect(page.getByText(LEVEL_GPA[locale], { exact: true }).first()).toBeVisible();
      expect(await termLines(page, locale)).toEqual([]);
    });

    test("dashboard and grades never mention terms", async ({ page }) => {
      await seedProfile(page, { career: "esp", locale });
      await seedEspGrades(page);
      for (const route of ["", "/grades"]) {
        await page.goto(`/${locale}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        expect(await termLines(page, locale)).toEqual([]);
      }
    });
  });
}

test.describe("Commercial SE keeps its term wording", () => {
  test("statistics legend, forecast scope and GPA card still say Term", async ({ page }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded-se-wording")) return;
      sessionStorage.setItem("seeded-se-wording", "1");
      localStorage.setItem(
        "jala-gpa-store",
        JSON.stringify({
          state: { gradesByCohort: { "cohort-2-2026": { "CSPR-111": "A", "MATH-111": "B" } }, selectedCohortId: "cohort-2-2026" },
          version: 0,
        }),
      );
    });
    await gotoStatistics(page);
    await page.waitForTimeout(800);
    expect(await page.locator(".recharts-legend-item-text").allInnerTexts()).toContain("Term GPA");

    await gotoForecast(page);
    await expect(page.getByRole("button", { name: "Term", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Level", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Term", exact: true }).click();
    await expect(page.getByText("Term GPA", { exact: true }).first()).toBeVisible();
  });

  test("dashboard and grades are unaffected", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    await expect(page.getByText("Terms Completed").first()).toBeVisible();
    await gotoGrades(page);
    await expect(page.getByText("Term GPA").first()).toBeVisible();
  });
});

test.describe("The 'Detected Level' notice only appears when the level came from imported or legacy grades", () => {
  const card = (page: Page, code: string) =>
    page
      .getByText(code, { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
      .first();

  async function grade(page: Page, code: string, value: string) {
    const trigger = card(page, code).getByRole("button", { name: "—" });
    await trigger.click();
    await trigger.locator("..").getByRole("button", { name: value, exact: true }).click();
    await page.waitForTimeout(200);
  }

  test("choosing Level 1 and grading Level 1 labs shows no notice", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 1", exact: true }).first().click();
    await grade(page, "ESP-101-M3L1", "B");
    await expect(page.getByText(/Detected Level/)).toHaveCount(0);
  });

  test("grading Level 1 labs without touching the toggle shows no notice either", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await grade(page, "ESP-101-M3L1", "B");
    await expect(page.getByText(/Detected Level/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Level 1", exact: true }).first()).toHaveAttribute("aria-pressed", "true");
  });

  test("choosing Level 1 in another cohort and switching cohort does not show a notice after grading", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "Level 1", exact: true }).first().click();
    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.getByRole("button", { name: /Cohort 1 \(I - 2023\)/ }).click();
    await page.waitForTimeout(300);
    await grade(page, "ESP-101-M3L1", "B");
    await expect(page.getByText(/Detected Level/)).toHaveCount(0);
  });

  test("a Level 2 transcript imported with no level chosen does show it, and choosing a level dismisses it", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded-detected")) return;
      sessionStorage.setItem("seeded-detected", "1");
      localStorage.setItem(
        "jala-esp-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: { "cohort-2-2026": { "ESP-201-M2L2": "A", "ESP-201-M3L2": "B" } },
            selectedCohortId: "cohort-2-2026",
            placementLevelByCohort: {},
          },
          version: 0,
        }),
      );
    });
    await gotoGrades(page);
    await expect(page.getByText(/Detected Level 2 from your grades/)).toBeVisible();
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await expect(page.getByText(/Detected Level/)).toHaveCount(0);
  });

  test("the dashboard says 'Default' for a Level 1 student who never chose, not 'Detected'", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedEspGrades(page);
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Starting Level\s*\n\s*Level 1\s*\n\s*Default, change it in Grades/);
    expect(text).not.toContain("Detected from your grades");
  });
});

test.describe("Special Labs explain when they apply", () => {
  test("only Special Lab cards in ESP Grades carry the tooltip", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    const hint = /Only assigned to you if needed/;
    const special = page.getByText("ESP-301-M12", { exact: true }).locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").first();
    await special.scrollIntoViewIfNeeded();
    await special.getByRole("button", { name: hint }).hover();
    await expect(page.getByRole("tooltip").getByText(hint)).toBeVisible();

    const regular = page.getByText("ESP-101-M3L1", { exact: true }).locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]").first();
    await expect(regular.getByRole("button", { name: hint })).toHaveCount(0);
  });
});
