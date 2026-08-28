import { test, expect } from "@playwright/test";

test.describe("Legacy route redirects", () => {
  test("root path redirects to the default locale", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("/config redirects to /grades, preserving locale", async ({ page }) => {
    await page.goto("/es/config");
    await expect(page).toHaveURL(/\/es\/grades$/);
  });

  test("/config/playground redirects to /grades/playground, preserving locale", async ({
    page,
  }) => {
    await page.goto("/pt/config/playground");
    await expect(page).toHaveURL(/\/pt\/grades\/playground$/);
  });
});
