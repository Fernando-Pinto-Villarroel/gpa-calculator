import { test, expect } from "@playwright/test";
import { seedProfile, gotoPlayground } from "./fixtures";

test.describe("Playground - orphaned assignments after group deletion", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoPlayground(page);
    // "Professionalism & Attendance" is graded 50/50 by default, which would
    // otherwise keep contributing to the Total independently of what this
    // suite is testing. Un-grade it so Total is driven only by Capstone.
    const professionalismRow = page
      .getByText("Professionalism & Attendance", { exact: true })
      .locator("../../..");
    await professionalismRow.getByTitle("Click to enter a score").click();
    const inputs = professionalismRow.locator('input[type="number"]');
    await inputs.nth(1).fill("0");
    await inputs.nth(1).blur();
  });

  async function gradeCapstone(page: import("@playwright/test").Page, score: string, max: string) {
    const row = page.getByText("Capstone Project", { exact: true }).locator("../../..");
    await row.getByRole("button", { name: "Ungraded" }).click();
    const inputs = row.locator('input[type="number"]');
    await inputs.nth(0).fill(score);
    await inputs.nth(1).fill(max);
    await inputs.nth(1).blur();
    return row;
  }

  test("deleting a group excludes its assignments from the Total, without crashing", async ({
    page,
  }) => {
    await gradeCapstone(page, "40", "40");
    await expect(page.locator('[data-tour="playground-total"]')).toContainText("100.00%");

    const projectsRow = page.locator('[data-tour="playground-groups-table"] tr', {
      hasText: "PROJECTS",
    });
    await projectsRow.getByRole("button", { name: "Remove group" }).click();

    await expect(page.locator('[data-tour="playground-groups-table"]')).not.toContainText(
      "PROJECTS",
    );
    await expect(page.locator('[data-tour="playground-total"]')).toContainText("—");
    await expect(page.getByText("Weights must add up to 100%")).toBeVisible();

    // Page stays functional: other groups/assignments are still interactive.
    const labsRow = page.locator('[data-tour="playground-groups-table"] tr', {
      hasText: "WEEKLY FACULTY PRACTICUM LABS",
    });
    await expect(labsRow.locator('input[type="number"]')).toBeVisible();
  });

  test("an orphaned assignment shows a disabled 'No group' option in its dropdown", async ({
    page,
  }) => {
    const row = page.getByText("Capstone Project", { exact: true }).locator("../../..");

    const projectsRow = page.locator('[data-tour="playground-groups-table"] tr', {
      hasText: "PROJECTS",
    });
    await projectsRow.getByRole("button", { name: "Remove group" }).click();

    const select = row.locator("select");
    await expect(select).toHaveValue(/group-projects/);
    const disabledOption = select.locator('option[disabled]');
    await expect(disabledOption).toHaveText("No group");
  });

  test("reassigning an orphaned assignment to an existing group restores it to the Total", async ({
    page,
  }) => {
    const row = await gradeCapstone(page, "40", "40");

    const projectsRow = page.locator('[data-tour="playground-groups-table"] tr', {
      hasText: "PROJECTS",
    });
    await projectsRow.getByRole("button", { name: "Remove group" }).click();
    await expect(page.locator('[data-tour="playground-total"]')).toContainText("—");

    await row.locator("select").selectOption({ label: "WEEKLY FACULTY PRACTICUM LABS" });

    await expect(page.locator('[data-tour="playground-total"]')).toContainText("100.00%");
    const select = row.locator("select");
    await expect(select.locator('option[disabled]')).toHaveCount(0);
  });
});
