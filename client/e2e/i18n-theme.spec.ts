import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard, readLocalStorageJson } from "./fixtures";

test.describe("i18n and theme", () => {
  test("switching locale via URL changes visible text", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    await expect(page.getByRole("link", { name: "Grades", exact: true })).toBeVisible();

    await page.goto("/es/", { waitUntil: "networkidle" });
    await expect(page.getByRole("navigation").getByRole("link", { name: "Notas", exact: true })).toBeVisible();

    await page.goto("/pt/", { waitUntil: "networkidle" });
    await expect(page.getByRole("navigation").getByRole("link", { name: "Notas", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Painel" })).toBeVisible();
  });

  test("switching language from the header menu persists across reload", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);

    await page.locator('button[aria-label="More Options"]').click();
    await page.getByRole("button", { name: "Español" }).click();
    await page.waitForURL(/\/es/);

    await expect(page.getByRole("navigation").getByRole("link", { name: "Notas", exact: true })).toBeVisible();

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("navigation").getByRole("link", { name: "Notas", exact: true })).toBeVisible();
  });

  test("dark mode toggle persists and applies the dark class", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);

    const isDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkBefore).toBe(false);

    await page.locator('button[aria-label="More Options"]').click();
    await page.getByText("Dark Mode").click();
    await page.waitForTimeout(300);

    const isDarkAfter = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkAfter).toBe(true);

    const themeState = await readLocalStorageJson<{ state: { theme: string } }>(
      page,
      "jala-gpa-theme",
    );
    expect(themeState?.state.theme).toBe("dark");

    await page.reload({ waitUntil: "networkidle" });
    const isDarkAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(isDarkAfterReload).toBe(true);
  });
});
