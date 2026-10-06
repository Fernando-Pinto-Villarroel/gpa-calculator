import { test, expect, Page, Locator } from "@playwright/test";
import { seedProfile, gotoGrades, gotoDashboard } from "./fixtures";

function courseCard(page: Page, courseCode: string): Locator {
  return page
    .getByText(courseCode, { exact: true })
    .locator("xpath=ancestor::div[contains(@class,'rounded-xl')][1]")
    .first();
}

type Attempt = { credits: number; grade: string | null; approved: boolean };

function seedGrades(page: Page, entries: Record<string, string | Attempt[]>) {
  return page.addInitScript((entries) => {
    if (sessionStorage.getItem("seeded-dminus")) return;
    sessionStorage.setItem("seeded-dminus", "1");
    localStorage.setItem(
      "jala-gpa-store",
      JSON.stringify({
        state: {
          gradesByCohort: { "cohort-2-2026": entries },
          selectedCohortId: "cohort-2-2026",
        },
        version: 0,
      }),
    );
  }, entries);
}

const PASSED_HINT = "An F can't be marked as passed.";

async function openRetakes(page: Page, code: string) {
  await courseCard(page, code)
    .getByTitle("Mark as failed / manage retakes")
    .click();
  await page.waitForTimeout(300);
}

const passedToggle = (page: Page) =>
  page
    .getByText("Passed", { exact: true })
    .locator("xpath=following-sibling::button")
    .first();

test.describe("Retake modal: a D- can be marked as passed, an F cannot", () => {
  test("the Passed toggle is enabled for a D-", async ({ page }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [{ credits: 2, grade: "D-", approved: false }],
    });
    await gotoGrades(page);

    await openRetakes(page, "CSPR-111");
    await expect(page.getByTitle(PASSED_HINT)).toHaveCount(0);
    await expect(passedToggle(page)).toBeEnabled();
  });

  test("an F keeps its Passed toggle disabled", async ({ page }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "MATH-111": [{ credits: 3, grade: "F", approved: false }],
    });
    await gotoGrades(page);

    await openRetakes(page, "MATH-111");
    await expect(page.getByTitle(PASSED_HINT)).toBeDisabled();
  });

  test("marking a D- as passed in the modal and saving completes the course with its credits", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [{ credits: 2, grade: "D-", approved: false }],
    });
    await gotoGrades(page);

    await openRetakes(page, "CSPR-111");
    await passedToggle(page).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForTimeout(300);

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*1\s*\n\s*\/ 52/);
    expect(text).toMatch(/Earned Credits\s*\n\s*2\s*\n\s*of 133/);
  });

  test("marking a D- attempt as passed counts the course as completed with its credits", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "D-", approved: true },
      ],
    });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*1\s*\n\s*\/ 52/);
    expect(text).toMatch(/Earned Credits\s*\n\s*2\s*\n\s*of 133/);
  });

  test("the same D- attempt left unmarked does not count as completed", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "D-", approved: false },
      ],
    });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0\s*\n\s*\/ 52/);
  });

  test("changing an approved D- to an F clears the approval", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "D-", approved: true },
      ],
    });
    await gotoGrades(page);

    await openRetakes(page, "CSPR-111");
    await expect(page.getByTitle(PASSED_HINT)).toHaveCount(1);
    const dialog = page.locator("div.fixed.inset-0").last();
    await dialog.locator("button", { hasText: "D-" }).first().click();
    await page.getByRole("button", { name: "F", exact: true }).last().click();
    await page.waitForTimeout(200);
    await expect(page.getByTitle(PASSED_HINT)).toHaveCount(2);
  });

  test("three attempts where the last one is an approved D- are not exhausted", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "F", approved: false },
        { credits: 2, grade: "D-", approved: true },
      ],
    });
    await gotoDashboard(page);
    await expect(page.getByText("Attempts exhausted")).toHaveCount(0);
  });

  test("legacy data with an approved F is still treated as not passed", async ({
    page,
  }) => {
    await seedProfile(page);
    await seedGrades(page, {
      "CSPR-111": [{ credits: 2, grade: "F", approved: true }],
    });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0\s*\n\s*\/ 52/);
  });
});

test.describe("A single D- counts as passed by default, an F opens the retakes dialog", () => {
  test("picking a D- keeps it passed, and the dialog explains how to register a retake instead", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const card = courseCard(page, "CSPR-111");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "D-", exact: true }).click();

    await expect(
      page.getByText(
        /the university sometimes approves it, so it is counted as passed/,
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Register it as a retake" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Keep it as passed" }).click();

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*1\s*\n\s*\/ 52/);
    expect(text).toMatch(/Earned Credits\s*\n\s*2\s*\n\s*of 133/);
  });

  test("choosing to register a D- as a retake makes it count as failed", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const card = courseCard(page, "CSPR-111");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "D-", exact: true }).click();
    await page.getByRole("button", { name: "Register it as a retake" }).click();
    await expect(page.getByText("Attempt 1")).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();

    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0\s*\n\s*\/ 52/);
  });

  test("picking an F goes straight to the attempts list, with no question first", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);

    const card = courseCard(page, "CSPR-111");
    await card.getByRole("button", { name: "—" }).click();
    await page.getByRole("button", { name: "F", exact: true }).click();

    await expect(page.getByText("Did you fail this course?")).toHaveCount(0);
    await expect(page.getByText("Attempt 1")).toBeVisible();
    await expect(page.getByTitle(PASSED_HINT)).toBeDisabled();
  });

  test("a single F left alone still counts as not passed", async ({ page }) => {
    await seedProfile(page);
    await seedGrades(page, { "CSPR-111": "F" });
    await gotoDashboard(page);
    const text = await page.locator("main").innerText();
    expect(text).toMatch(/Completed Subjects\s*\n\s*0\s*\n\s*\/ 52/);
  });
});
