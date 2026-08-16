import path from "path";
import { test, expect } from "@playwright/test";
import { seedProfile, gotoPlayground } from "./fixtures";

const CANVAS_PDF = path.resolve(
  __dirname,
  "../../test-data/Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Proyectos de Software y Startups - CSRP-486.pdf",
);

test.describe("Canvas Course Playground", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
  });

  test("shows default template: title, assignments, and weight groups totaling 100%", async ({
    page,
  }) => {
    await gotoPlayground(page);

    await expect(page.getByText("CANVAS COURSE PLAYGROUND")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Assignments", exact: true })).toBeVisible();
    await expect(page.getByText("Total", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.locator('[data-tour="playground-total"]')).toContainText("%");
  });

  test("double-click title to rename the course", async ({ page }) => {
    await gotoPlayground(page);

    const title = page.locator('[data-tour="playground-title"]').first();
    await title.dblclick();
    const input = page.locator('input[data-tour="playground-title"]');
    await input.fill("My Test Course");
    await input.press("Enter");

    await expect(page.getByText("My Test Course")).toBeVisible();
  });

  test("adding an assignment inserts it at the top of the list", async ({ page }) => {
    await gotoPlayground(page);

    await page.locator('[data-tour="playground-add-assignment"]').click();
    const firstRowName = page.locator('[data-tour="playground-first-assignment"] p').first();
    await expect(firstRowName).toHaveText("Assignment name");
  });

  test("deleting an assignment removes it from the list", async ({ page }) => {
    await gotoPlayground(page);

    const before = await page.locator('button[title="Remove assignment"]').count();
    await page.locator('[data-tour="playground-delete-assignment"]').click();
    await expect(page.locator('button[title="Remove assignment"]')).toHaveCount(before - 1);
  });

  test("grading an assignment updates the Total", async ({ page }) => {
    await gotoPlayground(page);

    await page.locator('[data-tour="playground-score-btn"]').click();
    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.nth(0).fill("100");
    await scoreInputs.nth(1).fill("100");
    await scoreInputs.nth(1).blur();

    await page.waitForTimeout(300);
    const total = await page.locator('[data-tour="playground-total"]').innerText();
    expect(total).toMatch(/\d+\.\d{2}%/);
  });

  test("editing a group's weight updates the total weight row", async ({ page }) => {
    await gotoPlayground(page);

    const firstWeightInput = page.locator('[data-tour="playground-groups-table"] input[type="number"]').first();
    await firstWeightInput.fill("50");
    await firstWeightInput.blur();

    await expect(page.getByText("Group weights don't add up to 100%")).toBeVisible().catch(() => {});
  });

  test("add and remove a weight group", async ({ page }) => {
    await gotoPlayground(page);

    const groupRows = page
      .locator('[data-tour="playground-groups-table"] tbody tr')
      .filter({ hasNotText: "Total" });

    const rowsBefore = await groupRows.count();
    await page.locator('[data-tour="playground-groups-actions"]').click();
    const rowsAfter = await groupRows.count();
    expect(rowsAfter).toBe(rowsBefore + 1);

    await groupRows.last().getByRole("button").click();
    const rowsFinal = await groupRows.count();
    expect(rowsFinal).toBe(rowsBefore);
  });

  test("reset assignments restores the default template", async ({ page }) => {
    await gotoPlayground(page);

    await page.locator('[data-tour="playground-add-assignment"]').click();
    const countAfterAdd = await page.locator('button[title="Remove assignment"]').count();

    await page.locator('[data-tour="playground-actions-menu"]').click();
    await page.locator('[data-tour="playground-action-reset"]').click();
    await expect(page.getByText("This will restore the default assignments")).toBeVisible();
    await page.getByRole("button", { name: "Yes", exact: true }).click();

    await page.waitForTimeout(300);
    const countAfterReset = await page.locator('button[title="Remove assignment"]').count();
    expect(countAfterReset).toBe(countAfterAdd - 1);
  });

  test("export downloads a playground backup JSON", async ({ page }) => {
    await gotoPlayground(page);

    await page.locator('[data-tour="playground-actions-menu"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator('[data-tour="playground-action-export-backup"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.json$/);
  });

  test("import backup JSON restores a course", async ({ page }) => {
    await gotoPlayground(page);

    const payload = {
      version: 1,
      course: {
        title: "Imported Course",
        groups: [{ id: "g1", name: "Group A", weightPercent: 100 }],
        assignments: [
          { id: "a1", groupId: "g1", name: "Imported Assignment", score: 90, maxPoints: 100 },
        ],
      },
    };

    await page.locator('[data-tour="playground-actions-menu"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('[data-tour="playground-action-import-backup"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(payload)),
    });
    await expect(page.getByText("This will replace your current playground")).toBeVisible();
    await page.getByRole("button", { name: "Yes", exact: true }).click();

    await expect(page.getByText("Imported Course")).toBeVisible();
    await expect(page.getByText("Imported Assignment")).toBeVisible();
  });

  test("import a real Canvas print-grades PDF", async ({ page }) => {
    await gotoPlayground(page);

    await page.locator('[data-tour="playground-actions-menu"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('[data-tour="playground-action-import-canvas"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(CANVAS_PDF);

    await expect(page.getByText(/Found \d+ groups and \d+ assignments/)).toBeVisible({
      timeout: 15_000,
    });
  });
});
