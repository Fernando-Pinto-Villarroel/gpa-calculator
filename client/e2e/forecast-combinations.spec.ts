import { test, expect } from "@playwright/test";
import { seedProfile, gotoForecast } from "./fixtures";

async function projectedGpas(page: import("@playwright/test").Page): Promise<number[]> {
  const text = await page.locator('[data-tour="forecast-combinations"]').innerText();
  return (text.match(/^\d\.\d{3}$/gm) ?? []).map(Number);
}

// "Optimal grade distributions to reach your target" means the least a
// student needs: every combination shown must reach the target, and they must
// be the ones closest to it. Version 1 behaved like this; a v2 change explored
// the search space best-grades-first under a result cap, so it mostly showed
// "all A" combinations, which do not help planning.
test.describe("Forecast combinations - the least you need to reach the target", () => {
  test("a 3.0 target with no grades is reached with all B, not with all A", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);

    await page.locator('[data-tour="forecast-target"] input').fill("3.0");
    await page.waitForTimeout(600);

    const section = page.locator('[data-tour="forecast-combinations"]');
    await expect(section).toBeVisible({ timeout: 10000 });
    const gpas = await projectedGpas(page);
    expect(gpas.length).toBeGreaterThan(0);
    for (const gpa of gpas) {
      expect(gpa).toBeGreaterThanOrEqual(3.0);
      expect(gpa).toBeLessThan(3.05);
    }
    expect(await section.innerText()).toMatch(/\d+×B(?![+-])/);
  });

  test("a 3.5 target proposes combinations just above 3.5, not 4.00", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);

    await page.locator('[data-tour="forecast-target"] input').fill("3.5");
    await page.waitForTimeout(600);

    await expect(page.locator('[data-tour="forecast-combinations"]')).toBeVisible({ timeout: 10000 });
    const gpas = await projectedGpas(page);
    expect(gpas.length).toBeGreaterThan(0);
    for (const gpa of gpas) {
      expect(gpa).toBeGreaterThanOrEqual(3.5);
      expect(gpa).toBeLessThan(3.56);
    }
  });

  test("a target that needs the best grade includes it", async ({ page }) => {
    await seedProfile(page);
    await gotoForecast(page);

    await page.locator('[data-tour="forecast-target"] input').fill("3.9");
    await page.waitForTimeout(600);

    const section = page.locator('[data-tour="forecast-combinations"]');
    await expect(section).toBeVisible({ timeout: 10000 });
    expect(await section.innerText()).toMatch(/\d+×A(?!-)/);
  });

  // CombinationCard suppresses the "×Ncr" credit-group badges for ESP
  // (`!isEsp && alloc.creditGroups.map(...)`), since ESP courses carry no
  // credit hours. This was implemented but never actually verified.
  test("ESP combinations show grade badges but never credit badges", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoForecast(page);

    const targetInput = page.locator('[data-tour="forecast-target"] input');
    await targetInput.fill("3.0");
    await page.waitForTimeout(600);

    const combinationsSection = page.locator('[data-tour="forecast-combinations"]');
    await expect(combinationsSection).toBeVisible({ timeout: 10000 });

    const sectionText = await combinationsSection.innerText();
    expect(sectionText).toMatch(/\d+×[A-F][+-]?/);
    expect(sectionText).not.toMatch(/\d+×\d+cr/);
  });
});
