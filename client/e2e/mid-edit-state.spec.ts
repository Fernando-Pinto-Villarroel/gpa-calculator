import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoPlayground, readLocalStorageJson } from "./fixtures";

async function switchLanguage(page: import("@playwright/test").Page, label: string) {
  await page.locator('button[aria-label="More Options"]').click();
  await page.getByRole("button", { name: label, exact: true }).click();
}

test.describe("Mid-edit interruptions - career/language switches don't crash or corrupt data", () => {
  test("the retake modal's backdrop blocks background navbar interaction while open", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.locator('[data-tour="first-retake-btn"]').click();
    await expect(page.getByText("Did you fail this course?")).toBeVisible();

    // The modal's fixed-position backdrop should make the navbar unclickable
    // while it's open — confirms a career switch mid-modal isn't reachable
    // through the UI at all (not just untested).
    let intercepted = false;
    try {
      await page.locator('button[aria-label="Career"]').click({ timeout: 1500 });
    } catch (err) {
      intercepted = /intercepts pointer events/i.test(String(err));
    }
    expect(intercepted).toBe(true);

    await page.getByText("No, keep single grade").click();
    await expect(page.locator('[data-tour="first-course-card"]')).toContainText("A");
  });

  test("switching language mid-edit on a credits input saves the in-progress value via the natural blur, without corrupting it", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const badge = page.locator('[data-tour="first-credits-badge"]');
    await badge.dblclick();
    const creditInput = page.locator('[data-tour="first-course-card"] input[type="number"]');
    await creditInput.fill("3");

    await switchLanguage(page, "Español");
    await expect(page).toHaveURL(/\/es\//);
    await expect(page.locator("body")).not.toContainText("Error");

    // Navigating away blurs the focused input, which triggers its normal
    // save handler — the typed value is committed cleanly, not corrupted
    // or silently dropped.
    const store = await readLocalStorageJson<{
      state: { gradesByCohort: Record<string, Record<string, unknown>> };
    }>(page, "jala-gpa-store");
    const entry = store!.state.gradesByCohort["cohort-2-2026"]["CSPR-111"];
    expect(entry).toEqual([{ credits: 3, grade: null, approved: false }]);
  });

  test("switching language mid-rename in Playground saves the in-progress title via the natural blur, without corrupting it", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoPlayground(page);

    const title = page.locator('[data-tour="playground-title"]').first();
    await title.dblclick();
    const input = page.locator('input[data-tour="playground-title"]');
    await input.fill("Unsaved Draft Title");

    await switchLanguage(page, "Español");
    await expect(page).toHaveURL(/\/es\//);
    await expect(page.locator("body")).not.toContainText("Error");

    const titleAfter = page.locator('[data-tour="playground-title"]').first();
    await expect(titleAfter).toContainText("Unsaved Draft Title");

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('[data-tour="playground-title"]').first()).toContainText(
      "Unsaved Draft Title",
    );
  });
});
