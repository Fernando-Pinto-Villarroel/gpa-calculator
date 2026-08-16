import { test, expect } from "@playwright/test";
import { seedProfile, switchCareer, gotoGrades, gotoDashboard, readLocalStorageJson } from "./fixtures";

test.describe("Career switching", () => {
  test("defaults to Commercial Software Engineering", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    await expect(page.locator('button[aria-label="Career"]')).toContainText(
      "Commercial Software",
    );
  });

  test("grading in Commercial SE does not affect ESP grades, and vice versa", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    const commercialStore = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-gpa-store");
    const commercialGraded = Object.values(
      commercialStore!.state.gradesByCohort["cohort-2-2026"],
    ).filter((v) => v !== null).length;
    expect(commercialGraded).toBe(1);

    await switchCareer(page, "esp");
    await gotoGrades(page);

    const espStore = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-esp-gpa-store");
    const espGraded = espStore
      ? Object.values(espStore.state.gradesByCohort["cohort-2-2026"] ?? {}).filter(
          (v) => v !== null,
        ).length
      : 0;
    expect(espGraded).toBe(0);

    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "B", exact: true }).click();

    const espStoreAfter = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-esp-gpa-store");
    const espGradedAfter = Object.values(
      espStoreAfter!.state.gradesByCohort["cohort-2-2026"],
    ).filter((v) => v !== null).length;
    expect(espGradedAfter).toBe(1);

    const commercialStoreAfter = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-gpa-store");
    const commercialGradedAfter = Object.values(
      commercialStoreAfter!.state.gradesByCohort["cohort-2-2026"],
    ).filter((v) => v !== null).length;
    expect(commercialGradedAfter).toBe(1);
  });

  test("selected career persists across reload", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    await switchCareer(page, "esp");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('button[aria-label="Career"]')).toContainText("ESP:");
  });

  test("dashboard stats adapt: courses instead of credits for ESP", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);

    await expect(page.getByText("Courses Passed").first()).toBeVisible();
    await expect(page.getByText("Levels Completed").first()).toBeVisible();
    await expect(page.getByText("Earned Credits")).toHaveCount(0);
  });

  test("mobile: career icon differs between careers", async ({ page }) => {
    await seedProfile(page);
    await page.setViewportSize({ width: 375, height: 800 });
    await gotoDashboard(page);
    const commercialIconHtml = await page
      .locator('button[aria-label="Career"] svg')
      .first()
      .innerHTML();

    await switchCareer(page, "esp");
    const espIconHtml = await page
      .locator('button[aria-label="Career"] svg')
      .first()
      .innerHTML();

    expect(commercialIconHtml).not.toBe(espIconHtml);
  });
});
