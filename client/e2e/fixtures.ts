import { Page } from "@playwright/test";

export const DEFAULT_COMMERCIAL_COHORT_ID = "cohort-2-2026";
export const DEFAULT_ESP_COHORT_ID = "cohort-2-2026";

interface SeedOptions {
  locale?: "en" | "es" | "pt";
  theme?: "light" | "dark";
  career?: "software_engineering_design_architecture" | "esp";
  tourCompleted?: boolean;
}

/**
 * Seeds localStorage before the app's first script runs, so the guided tour
 * doesn't auto-start and state (theme/career/locale) is deterministic.
 * Must be called before the first page.goto() in a test.
 */
export async function seedProfile(page: Page, options: SeedOptions = {}) {
  const { theme = "light", career = "software_engineering_design_architecture", tourCompleted = true } = options;

  // addInitScript re-runs on every navigation within the test (not just the
  // first), so each key is only seeded if absent — otherwise it would clobber
  // runtime changes (e.g. a career switch) made via the UI between navigations.
  await page.addInitScript(
    ({ theme, career, tourCompleted }) => {
      if (!localStorage.getItem("jala-gpa-tour")) {
        localStorage.setItem(
          "jala-gpa-tour",
          JSON.stringify({
            state: { guidedTourCompleted: tourCompleted, globalStepIndex: 0 },
            version: 0,
          }),
        );
      }
      if (!localStorage.getItem("jala-gpa-theme")) {
        localStorage.setItem(
          "jala-gpa-theme",
          JSON.stringify({ state: { theme }, version: 0 }),
        );
      }
      if (!localStorage.getItem("jala-career-store")) {
        localStorage.setItem(
          "jala-career-store",
          JSON.stringify({ state: { selectedCareerId: career }, version: 0 }),
        );
      }
    },
    { theme, career, tourCompleted },
  );
}

export function localePath(locale: string, path: string = "") {
  return `/${locale}${path}`;
}

export async function gotoDashboard(page: Page, locale = "en") {
  await page.goto(localePath(locale, "/"), { waitUntil: "networkidle" });
}

export async function gotoGrades(page: Page, locale = "en") {
  await page.goto(localePath(locale, "/grades"), { waitUntil: "networkidle" });
}

export async function gotoPlayground(page: Page, locale = "en") {
  await page.goto(localePath(locale, "/grades/playground"), {
    waitUntil: "networkidle",
  });
}

export async function gotoStatistics(page: Page, locale = "en") {
  await page.goto(localePath(locale, "/statistics"), { waitUntil: "networkidle" });
}

export async function gotoForecast(page: Page, locale = "en") {
  await page.goto(localePath(locale, "/forecast"), { waitUntil: "networkidle" });
}

export async function switchCareer(
  page: Page,
  career: "commercial" | "esp",
) {
  await page.locator('button[aria-label="Career"]').click();
  await page.waitForTimeout(200);
  const optionText = career === "esp" ? /ESP:/ : /Commercial Software/;
  await page.getByRole("button", { name: optionText }).click();

  // The trigger's label span is CSS-hidden on mobile (`hidden sm:inline`), so
  // wait on the store value itself rather than any particular DOM node's visibility.
  await page.waitForFunction(
    (expectedCareer) => {
      const raw = localStorage.getItem("jala-career-store");
      if (!raw) return false;
      try {
        return JSON.parse(raw).state.selectedCareerId === expectedCareer;
      } catch {
        return false;
      }
    },
    career === "esp" ? "esp" : "software_engineering_design_architecture",
  );
}

export async function readLocalStorageJson<T = unknown>(
  page: Page,
  key: string,
): Promise<T | null> {
  return page.evaluate((k) => {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  }, key);
}
