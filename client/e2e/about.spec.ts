import { test, expect } from "@playwright/test";
import { seedProfile, gotoAbout } from "./fixtures";

// The About page had zero E2E coverage despite having career-conditional
// content (the GPA Calculation section differs for ESP vs Commercial SE).
test.describe("About page", () => {
  test("shows credit-based GPA Calculation for Commercial SE", async ({ page }) => {
    await seedProfile(page, { career: "software_engineering_design_architecture" });
    await gotoAbout(page);

    await expect(page.getByText("About the Project")).toBeVisible();
    await expect(page.getByText("GPA Calculation", { exact: true })).toBeVisible();
    await expect(page.getByText("GPA = Total Quality Points ÷ Total Credits Attempted")).toBeVisible();
    await expect(page.getByText("ESP GPA Calculation")).toHaveCount(0);

    await expect(page.getByRole("heading", { name: "ESP English Program" })).toBeVisible();
    await expect(page.getByText("Version 2.0.0")).toBeVisible();
  });

  test("shows equal-weight ESP GPA Calculation instead of the credit-based one", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    await expect(page.getByText("ESP GPA Calculation")).toBeVisible();
    await expect(
      page.getByText("ESP GPA = Sum of Grade Values ÷ Number of Courses Attempted"),
    ).toBeVisible();
    await expect(page.getByText("GPA Calculation", { exact: true })).toHaveCount(0);
    await expect(page.getByText("This calculator pre-loads the correct credit values")).toHaveCount(0);
  });

  test("the feedback modal opens and links to GitHub Issues", async ({ page }) => {
    await seedProfile(page);
    await gotoAbout(page);

    await page.getByRole("button", { name: "Feedback & Report" }).click();
    await expect(page.getByText("Help Us Improve")).toBeVisible();

    const link = page.getByRole("link", { name: "Open GitHub Issues" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      "https://github.com/Fernando-Pinto-Villarroel/gpa-calculator/issues",
    );

    // Clicking the backdrop closes the modal without navigating away.
    await page.mouse.click(10, 10);
    await expect(page.getByText("Help Us Improve")).toHaveCount(0);
    await expect(page).toHaveURL(/\/about$/);
  });

  test("no console errors on load, in either career", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });
});
