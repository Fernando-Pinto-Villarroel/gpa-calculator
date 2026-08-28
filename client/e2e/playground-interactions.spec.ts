import { test, expect } from "@playwright/test";
import { seedProfile, gotoPlayground } from "./fixtures";

test.describe("Playground - fine-grained interactions", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoPlayground(page);
  });

  test("dragging an assignment by its handle reorders the list", async ({ page }) => {
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

  test("course title is capped at 300 characters", async ({ page }) => {
    const title = page.locator('[data-tour="playground-title"]').first();
    await title.dblclick();
    const input = page.locator('input[data-tour="playground-title"]');
    await input.fill("x".repeat(400));
    const value = await input.inputValue();
    expect(value.length).toBe(300);
  });

  test("group name is capped at 300 characters", async ({ page }) => {
    const textarea = page.locator('[data-tour="playground-groups-table"] textarea').first();
    await textarea.fill("y".repeat(400));
    const value = await textarea.inputValue();
    expect(value.length).toBe(300);
  });

  test("assignment name is capped at 300 characters", async ({ page }) => {
    const name = page.locator('[data-tour="playground-first-assignment"] p').first();
    await name.dblclick();
    const input = page.locator('[data-tour="playground-first-assignment"] input').first();
    await input.fill("z".repeat(400));
    const value = await input.inputValue();
    expect(value.length).toBe(300);
  });

  test("negative scores are clamped to 0", async ({ page }) => {
    await page.locator('[data-tour="playground-score-btn"]').click();
    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.nth(0).fill("-15");
    await scoreInputs.nth(1).fill("-8");
    await scoreInputs.nth(1).blur();

    await page.locator('[data-tour="playground-score-btn"]').click();
    const reopenedInputs = page.locator('input[type="number"]');
    await expect(reopenedInputs.nth(0)).toHaveValue("0");
    await expect(reopenedInputs.nth(1)).toHaveValue("0");
  });

  test("professionalism assignment shows its info tooltip on click", async ({ page }) => {
    const infoButton = page.getByRole("button", {
      name: /Attendance & Professionalism only subtracts/,
    });
    await infoButton.click();
    await expect(page.getByText(/full attendance keeps its default 50\/50/)).toBeVisible();
  });

  test("weighting Total shows two decimal places", async ({ page }) => {
    await page.locator('[data-tour="playground-score-btn"]').click();
    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.nth(0).fill("17");
    await scoreInputs.nth(1).fill("20");
    await scoreInputs.nth(1).blur();
    await page.waitForTimeout(300);

    const total = await page.locator('[data-tour="playground-total"]').innerText();
    expect(total).toMatch(/\d+\.\d{2}%/);
  });

  test("deleting every assignment shows an empty state (Total: —) without crashing, and Add Assignment recovers it", async ({
    page,
  }) => {
    for (let i = 0; i < 30; i++) {
      const trashButtons = page.getByTitle("Remove assignment");
      if ((await trashButtons.count()) === 0) break;
      await trashButtons.first().click();
      await page.waitForTimeout(200);
    }

    await expect(page.getByTitle("Remove assignment")).toHaveCount(0);
    await expect(page.locator('[data-tour="playground-total"]')).toContainText("—");

    await page.getByRole("button", { name: "Add Assignment" }).click();
    await expect(page.getByTitle("Remove assignment")).toHaveCount(1);
  });
});
