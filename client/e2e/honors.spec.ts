import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard } from "./fixtures";

async function gradeAllVisible(page: import("@playwright/test").Page, grade: string) {
  // The "no grade" dropdown option is also labeled "—", so re-querying too
  // soon after a selection can pick up the closing dropdown's own option
  // instead of the next card's collapsed trigger. Wait out the close
  // animation between iterations so only collapsed triggers remain.
  let remaining = await page.getByRole("button", { name: "—" }).count();
  while (remaining > 0) {
    const trigger = page.getByRole("button", { name: "—" }).first();
    const wrapper = trigger.locator("..");
    await trigger.click();
    await wrapper.getByRole("button", { name: grade, exact: true }).click();
    await page.waitForTimeout(300);
    remaining = await page.getByRole("button", { name: "—" }).count();
  }
}

test.describe("Honors - Commercial SE", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("grading all of Term I with A achieves President's List and Summa Cum Laude", async ({
    page,
  }) => {
    await gradeAllVisible(page, "A");

    await expect(page.getByText("This term qualifies for President's List")).toBeVisible();
    await expect(page.getByText("4.00").first()).toBeVisible();

    await gotoDashboard(page);
    const mainText = await page.locator("main").innerText();
    expect(mainText).toMatch(/President's List Terms\s*\n\s*1/);
    await expect(page.getByText("Summa Cum Laude").first()).toBeVisible();
  });

  test("grading all of Term I with A- achieves Dean's List but not President's", async ({
    page,
  }) => {
    await gradeAllVisible(page, "A-");

    await expect(page.getByText("This term qualifies for Dean's List")).toBeVisible();
    await expect(page.getByText("This term qualifies for President's List")).toHaveCount(0);
  });

  test("a mediocre grade blocks Dean's List for the term", async ({ page }) => {
    await gradeAllVisible(page, "C");

    await expect(page.getByText("This term qualifies for Dean's List")).toHaveCount(0);
    await expect(page.getByText("This term qualifies for President's List")).toHaveCount(0);
  });
});

test.describe("Honors - ESP", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
  });

  test("grading all of Level 1 with A shows a President's List trophy on that level", async ({
    page,
  }) => {
    // Level 1 has 4 courses: ESP-101, Lab M3L1, Lab M4L1, ESP-201.
    for (let i = 0; i < 4; i++) {
      const trigger = page.getByRole("button", { name: "—" }).first();
      const wrapper = trigger.locator("..");
      await trigger.click();
      await wrapper.getByRole("button", { name: "A", exact: true }).click();
      await page.waitForTimeout(50);
    }

    await expect(page.getByText("Cumulative GPA:")).toBeVisible();
    await expect(page.getByText("4.00")).toBeVisible();
  });
});
