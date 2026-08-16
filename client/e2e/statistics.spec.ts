import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoStatistics } from "./fixtures";

test.describe("Statistics", () => {
  test("shows overview cards and all charts for Commercial SE", async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await gotoStatistics(page);
    await page.waitForSelector("text=Compiling", { state: "detached", timeout: 5000 }).catch(() => {});

    await expect(page.getByText("Current Cumulative GPA")).toBeVisible();
    await expect(page.getByText("Total Credits Earned")).toBeVisible();
    await expect(page.getByText("Projected Honor")).toBeVisible();
    await expect(page.getByText("Dean's List Terms")).toBeVisible();
    await expect(page.getByText("President's List Terms")).toBeVisible();

    await expect(page.getByText("Cumulative GPA Progression")).toBeVisible();
    await expect(page.getByText("Terms GPA Progression")).toBeVisible();
    await expect(page.getByText("Grade Distribution")).toBeVisible();
    await expect(page.getByText("Credit Accumulation")).toBeVisible();

    await expect(page.locator(".recharts-wrapper").first()).toBeVisible();
  });

  test("shows Level-based labels and course-based chart for ESP", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await gotoStatistics(page);
    await page.waitForSelector("text=Compiling", { state: "detached", timeout: 5000 }).catch(() => {});

    await expect(page.getByText("Total Courses Completed")).toBeVisible();
    await expect(page.getByText("Dean's List Levels")).toBeVisible();
    await expect(page.getByText("President's List Levels")).toBeVisible();
    await expect(page.getByText("Levels GPA Progression")).toBeVisible();
    await expect(page.getByText("Course Completion")).toBeVisible();

    await expect(page.getByText("Total Credits Earned")).toHaveCount(0);
    await expect(page.getByText("Terms GPA Progression")).toHaveCount(0);
  });
});
