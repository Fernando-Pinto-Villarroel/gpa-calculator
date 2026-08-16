import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, gotoPlayground } from "./fixtures";

const MOBILE_VIEWPORT = { width: 375, height: 800 };

test.describe("Mobile viewport - real interactions", () => {
  test("grading a Commercial SE course via the mobile card updates Term GPA", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoGrades(page);

    const card = page.locator('[data-tour="first-course-card-m"]');
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "A", exact: true }).click();

    await expect(card).toContainText("A");
    await expect(page.getByText("Term GPA:")).toBeVisible();
    await expect(page.getByText("4.00")).toBeVisible();
  });

  test("the retake modal opens and saves correctly from the mobile card", async ({ page }) => {
    await seedProfile(page);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoGrades(page);

    await page.locator('[data-tour="first-retake-btn-m"]').click();
    await expect(page.getByText("Did you fail this course?")).toBeVisible();
    await page.getByText("Yes, mark as retaken").click();
    await expect(page.getByText("Attempt 1")).toBeVisible();

    const attempt1 = page.getByText("Attempt 1", { exact: true }).locator("../..");
    await attempt1.getByRole("button", { name: /^F/ }).click();
    await page.getByRole("button", { name: "B", exact: true }).click();
    await attempt1.locator("button").last().click();
    await page.getByText("Save", { exact: true }).click();

    await expect(page.locator('[data-tour="first-course-card-m"]')).toContainText("B");
  });

  test("grading an ESP course on mobile (level tabs) updates cumulative GPA", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoGrades(page);

    const card = page.locator('[data-tour="first-course-card-m"]');
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "B+", exact: true }).click();

    await expect(card).toContainText("B+");
    await expect(page.getByText("Cumulative GPA:")).toBeVisible();
    await expect(page.getByText("3.30")).toBeVisible();
  });

  test("dragging an assignment by its handle still reorders the list at mobile width", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await gotoPlayground(page);

    const rows = page.locator('button[title="Remove assignment"]').locator("..");
    const firstNameBefore = await rows.nth(0).locator("p").first().innerText();
    const secondNameBefore = await rows.nth(1).locator("p").first().innerText();
    expect(firstNameBefore).not.toBe(secondNameBefore);

    const firstHandle = page.locator('[data-tour="playground-drag-handle"]');
    const box = await firstHandle.boundingBox();
    if (!box) throw new Error("drag handle not found");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 90, { steps: 10 });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 90, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);

    const firstNameAfter = await rows.nth(0).locator("p").first().innerText();
    expect(firstNameAfter).toBe(secondNameBefore);
  });
});
