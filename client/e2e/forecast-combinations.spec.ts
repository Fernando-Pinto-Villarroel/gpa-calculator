import { test, expect } from "@playwright/test";
import { seedProfile, gotoForecast } from "./fixtures";

// findCombinations() does a capped DFS over grade-count distributions and
// stops once it has collected maxResults*20 valid candidates, then sorts and
// slices to the top maxResults by projected GPA. The search previously tried
// LOW counts of the best allowed grade first, so for a large remaining-course
// pool the cap could be hit entirely within the "0 uses of the best grade"
// subtree — meaning the shown "best combinations" could systematically never
// include the top allowed grade at all, even though the user explicitly
// selected it. Fixed by exploring high-to-low instead of low-to-high.
test.describe("Forecast combinations - search finds genuinely best combinations", () => {
  test("with many remaining courses, the top combination uses the best allowed grade", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoForecast(page);

    const targetInput = page.locator('[data-tour="forecast-target"] input');
    await targetInput.fill("3.0");
    await page.waitForTimeout(600);

    const combinationsSection = page.locator('[data-tour="forecast-combinations"]');
    await expect(combinationsSection).toBeVisible({ timeout: 10000 });

    const sectionText = await combinationsSection.innerText();
    expect(sectionText).toMatch(/\d+×A(?!-)/);
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
    expect(sectionText).toMatch(/\d+×A(?!-)/);
    expect(sectionText).not.toMatch(/\d+×\d+cr/);
  });
});
