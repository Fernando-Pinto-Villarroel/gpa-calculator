import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoStatistics } from "./fixtures";

// Grades Term I, Module 1-3, in DOM order, with known credits from
// _shared.ts: CSPR-111(2cr)=A, MATH-111(3cr)=A, HIST-111(2cr)=A,
// CSOS-112(2cr)=B, MATH-112(3cr)=B, CSDB-112(2cr)=C.
// Quality points = 4.0*2 + 4.0*3 + 4.0*2 + 3.0*2 + 3.0*3 + 2.0*2 = 47
// Credits = 2+3+2+2+3+2 = 14 -> GPA = 47/14 = 3.357... -> "3.36"
const KNOWN_GRADES = ["A", "A", "A", "B", "B", "C"];
const EXPECTED_CUMULATIVE_GPA = "3.36";
// Distinct grade counts, in ALL_GRADES order (A, then B, then C): 3, 2, 1.

async function gradeKnownSet(page: import("@playwright/test").Page) {
  for (const g of KNOWN_GRADES) {
    const trigger = page.getByRole("button", { name: "—" }).first();
    const wrapper = trigger.locator("..");
    await trigger.click();
    await wrapper.getByRole("button", { name: g, exact: true }).click();
    await page.waitForTimeout(150);
  }
}

test.describe("Statistics charts show mathematically correct values", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await gradeKnownSet(page);
    await gotoStatistics(page);
    await page.waitForTimeout(600);
  });

  test("Cumulative GPA Progression chart's data point matches the computed GPA exactly", async ({
    page,
  }) => {
    const card = page.locator("h3", { hasText: "Cumulative GPA Progression" }).locator("../..");
    const dot = card.locator(".recharts-line-dot").first();
    await dot.hover();

    const tooltip = page.locator(".recharts-tooltip-wrapper:not(:empty)");
    await expect(tooltip).toContainText(EXPECTED_CUMULATIVE_GPA);
  });

  test("Grade Distribution chart's bars show the exact course counts per grade", async ({
    page,
  }) => {
    const card = page.locator("h3", { hasText: "Grade Distribution" }).locator("../..");
    const bars = card.locator(".recharts-rectangle");
    await expect(bars).toHaveCount(3);

    const tooltip = page.locator(".recharts-tooltip-wrapper:not(:empty)");

    await bars.nth(0).hover();
    await expect(tooltip).toContainText("3 courses");

    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    await bars.nth(1).hover();
    await expect(tooltip).toContainText("2 courses");

    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    await bars.nth(2).hover();
    await expect(tooltip).toContainText("1 courses");
  });
});
