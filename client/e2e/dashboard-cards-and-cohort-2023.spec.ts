import { test, expect, Page } from "@playwright/test";
import { seedProfile, gotoDashboard, gotoGrades, gotoAbout, gotoStatistics } from "./fixtures";

type Attempt = { credits: number; grade: string | null; approved: boolean };

function seedStore(
  page: Page,
  key: string,
  cohortId: string,
  entries: Record<string, string | Attempt[]>,
  extra: object = {},
) {
  return page.addInitScript(
    ({ key, cohortId, entries, extra }) => {
      if (sessionStorage.getItem(`seeded-${key}`)) return;
      sessionStorage.setItem(`seeded-${key}`, "1");
      localStorage.setItem(
        key,
        JSON.stringify({
          state: { gradesByCohort: { [cohortId]: entries }, selectedCohortId: cohortId, ...extra },
          version: 0,
        }),
      );
    },
    { key, cohortId, entries, extra },
  );
}

async function dashboardText(page: Page) {
  return page.locator("main").innerText();
}

test.describe("Dashboard cards are not redundant", () => {
  test("Commercial SE shows Rate of Progress instead of Remaining Credits", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", "cohort-2-2026", {
      "MATH-111": "A",
      "CSPR-111": "A",
      "HIST-111": "F",
    });
    await gotoDashboard(page);

    const text = await dashboardText(page);
    expect(text).toMatch(/Rate of Progress\s*\n\s*71%\s*\n\s*min\. 67%/);
    expect(text).not.toContain("Remaining Credits");
  });

  test("Commercial SE with no grades shows a dash for Rate of Progress", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    expect(await dashboardText(page)).toMatch(/Rate of Progress\s*\n\s*—/);
  });

  test("ESP shows Starting Level instead of Courses Remaining", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", "cohort-2-2026", { "ESP-201-M2L2": "A" }, {
      placementLevelByCohort: {},
    });
    await gotoDashboard(page);

    const text = await dashboardText(page);
    expect(text).toMatch(/Starting Level\s*\n\s*Level 2\s*\n\s*Detected from your grades/);
    expect(text).not.toContain("Courses Remaining");
  });

  test("ESP Starting Level says it is the default when nothing is chosen or detected", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);
    expect(await dashboardText(page)).toMatch(
      /Starting Level\s*\n\s*Level 1\s*\n\s*Default, change it in Grades/,
    );
  });

  test("an explicitly chosen level shows no source note", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", "cohort-2-2026", {}, {
      placementLevelByCohort: { "cohort-2-2026": "2" },
    });
    await gotoDashboard(page);
    const text = await dashboardText(page);
    expect(text).toMatch(/Starting Level\s*\n\s*Level 2/);
    expect(text).not.toMatch(/Detected from your grades|Default, change it in Grades/);
  });
});

test.describe("Dashboard info tooltips", () => {
  test("every Commercial SE card has an info button, and hovering it explains the card", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoDashboard(page);

    const buttons = page.locator('[data-testid="stat-card"] button[aria-label^="What is"]').locator("visible=true");
    await expect(buttons).toHaveCount(8);

    const ropInfo = page.getByRole("button", { name: "What is Rate of Progress?" }).first();
    await expect(async () => {
      await page.mouse.move(0, 0);
      await ropInfo.hover();
      await expect(page.getByRole("tooltip")).toContainText(
        "one of the two SAP (Satisfactory Academic Progress) conditions",
        { timeout: 1000 },
      );
    }).toPass({ timeout: 10_000 });
    await expect(page.getByRole("tooltip")).toContainText("below 67% you are at SAP risk");
  });

  test("ESP labs tooltip explains why the total depends on the level", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);

    await page.getByRole("button", { name: "What is Completed ESP Labs?" }).first().hover();
    await expect(page.getByRole("tooltip")).toContainText("Labs passed out of the 6 that count for you");
  });

  test("on a touch screen, tapping the icon opens the tooltip and tapping again closes it", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await seedProfile(page);
    await gotoDashboard(page);

    const button = page.getByRole("button", { name: "What is Earned Credits?" }).last();
    await button.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => {
        const before = await page.locator("main").evaluate((m) => m.scrollTop);
        await page.waitForTimeout(150);
        return before === (await page.locator("main").evaluate((m) => m.scrollTop));
      })
      .toBe(true);
    await button.tap();
    await expect(page.getByRole("tooltip")).toContainText("total credits of your curriculum");

    await button.tap();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await context.close();
  });

  test("keyboard focus opens the tooltip, so it stays accessible", async ({ page }) => {
    await seedProfile(page);
    await gotoDashboard(page);

    await page.getByRole("button", { name: "What is Completed Subjects?" }).first().focus();
    await expect(page.getByRole("tooltip")).toContainText("Courses you have passed");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });

  test("the Best Grade tooltip adds the course and its term as a detail", async ({ page }) => {
    await seedProfile(page);
    await seedStore(page, "jala-gpa-store", "cohort-2-2026", { "CSPR-111": "A", "MATH-111": "B" });
    await gotoDashboard(page);

    await page.getByRole("button", { name: "What is Best Grade?" }).first().hover();
    await expect(page.getByRole("tooltip")).toContainText("Programming 1 · Term I");
  });
});

test.describe("Dashboard card titles never get cut off", () => {
  for (const width of [320, 360, 390]) {
    test(`at ${width}px every card title is fully visible (no ellipsis, no overflow)`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await seedProfile(page, { locale: "es" });
      await page.goto("/es", { waitUntil: "networkidle" });

      const overflowing = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-testid="stat-card"]'))
          .filter((card) => (card as HTMLElement).offsetParent !== null)
          .map((card) => card.querySelector("p") as HTMLElement)
          .filter((title) => title.scrollWidth > title.clientWidth + 1)
          .map((title) => title.textContent),
      );
      expect(overflowing).toEqual([]);
      await context.close();
    });
  }
});

test.describe("ESP cohort I - 2023 has no module 2 (no ESP 1, no Lab M2L2)", () => {
  async function selectCohort2023(page: Page) {
    await page.locator('[data-tour="esp-cohort-selector"]').click();
    await page.getByRole("button", { name: /Cohort 1 \(I - 2023\)/ }).click();
    await page.waitForTimeout(300);
  }

  test("Level 1 in cohort I - 2023 lists no ESP 1 and needs 5 courses", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await selectCohort2023(page);

    await expect(page.getByText("ESP-101", { exact: true })).toHaveCount(0);
    await expect(page.getByText("ESP-201", { exact: true }).first()).toBeVisible();

    await gotoStatistics(page);
    await page.waitForTimeout(300);
    expect(await page.locator("main").innerText()).toMatch(/of 5 total/);
  });

  test("Level 2 in cohort I - 2023 lists no Lab M2L2 and has 7 labs", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(page, "jala-esp-gpa-store", "cohort-1-2023", {}, {
      placementLevelByCohort: { "cohort-1-2023": "2" },
    });
    await gotoGrades(page);

    await expect(page.getByText("ESP-201-M2L2", { exact: true })).toHaveCount(0);
    await expect(page.getByText("ESP-201-M3L2", { exact: true }).first()).toBeVisible();

    await gotoDashboard(page);
    expect(await dashboardText(page)).toMatch(/Completed ESP Labs\s*\n\s*0\s*\n\s*of 7/);
    await page.getByRole("button", { name: "What is Completed ESP Labs?" }).first().hover();
    await expect(page.getByRole("tooltip")).toContainText("Labs passed out of the 7 that count for you");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "What is Completed ESP Courses?" }).first().focus();
    await expect(
      page.getByRole("tooltip").filter({ hasText: "out of the 4 your starting level needs" }),
    ).toHaveCount(1);
  });

  test("Fernando's real route (Level 2 from M3) completes cohort I - 2023", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await seedStore(
      page,
      "jala-esp-gpa-store",
      "cohort-1-2023",
      {
        "ESP-201-M3L2": "A",
        "ESP-201-M4L2": "A",
        "ESP-201-M5L2": "A",
        "ESP-201-M6": "A",
        "ESP-201-M7": "A",
        "ESP-301": "A",
        "ESP-201-M9": "A",
        "ESP-201-M10": "A",
        "ESP-401": "A",
        "ESP-501": "A",
        "ESP-601": "A",
      },
      { placementLevelByCohort: {} },
    );
    await gotoDashboard(page);

    const text = await dashboardText(page);
    expect(text).toMatch(/Completed ESP Courses\s*\n\s*4\s*\n\s*\/ 4/);
    expect(text).toMatch(/Completed ESP Labs\s*\n\s*7\s*\n\s*of 7/);
    expect(text).toContain("4.00");
  });

  test("other cohorts still have ESP 1 and Lab M2L2", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoGrades(page);
    await expect(page.getByText("ESP-101", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Level 2", exact: true }).first().click();
    await expect(page.getByText("ESP-201-M2L2", { exact: true }).first()).toBeVisible();
  });
});

test.describe("ESP About layout", () => {
  test("Privacy & Data sits in the first column, under ESP GPA Calculation", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    const calc = await page.getByRole("heading", { name: "ESP GPA Calculation" }).boundingBox();
    const privacy = await page.getByRole("heading", { name: "Privacy & Data" }).boundingBox();
    expect(calc && privacy).toBeTruthy();
    expect(Math.abs(privacy!.x - calc!.x)).toBeLessThan(2);
    expect(privacy!.y).toBeGreaterThan(calc!.y);
  });

  test("the GPA formula text stays centered when the denominator wraps onto two lines", async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 900 });
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    const denominator = page.getByText("Number of Courses Attempted", { exact: true });
    await expect(denominator).toBeVisible();
    const lineCount = await denominator.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return new Set(Array.from(range.getClientRects()).map((r) => Math.round(r.top))).size;
    });
    expect(lineCount).toBeGreaterThan(1);
    expect(await denominator.evaluate((el) => getComputedStyle(el).textAlign)).toBe("center");
    expect(
      await page.getByText("Sum of Grade Values", { exact: true }).evaluate((el) => getComputedStyle(el).textAlign),
    ).toBe("center");
  });

  test("ESP says SAP does not apply because ESP is outside the Software Engineering degree GPA", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);
    await expect(page.locator("main")).toContainText(
      "SAP does not apply to ESP: its courses are non-credit and are not calculated into your Software Engineering degree GPA.",
    );
  });

  test("ESP puts Acknowledgments at the bottom of the third column, under ESP English Program", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    const rules = await page.getByRole("heading", { name: "ESP Levels & Rules" }).boundingBox();
    const program = await page.getByRole("heading", { name: "ESP English Program" }).boundingBox();
    const thanks = await page.getByRole("heading", { name: "Acknowledgments" }).boundingBox();
    const standing = await page.getByRole("heading", { name: "Academic standing in ESP" }).boundingBox();
    expect(Math.abs(thanks!.x - rules!.x)).toBeLessThan(2);
    expect(thanks!.y).toBeGreaterThan(program!.y);
    expect(standing!.x).toBeLessThan(thanks!.x);
  });

  test("Commercial SE keeps Acknowledgments above Privacy & Data in the third column", async ({ page }) => {
    await seedProfile(page);
    await gotoAbout(page);

    const thanks = await page.getByRole("heading", { name: "Acknowledgments" }).boundingBox();
    const privacy = await page.getByRole("heading", { name: "Privacy & Data" }).boundingBox();
    expect(Math.abs(thanks!.x - privacy!.x)).toBeLessThan(2);
    expect(thanks!.y).toBeLessThan(privacy!.y);
  });

  test("Commercial SE keeps Privacy & Data in the third column", async ({ page }) => {
    await seedProfile(page);
    await gotoAbout(page);

    const calc = await page.getByRole("heading", { name: "GPA Calculation" }).boundingBox();
    const privacy = await page.getByRole("heading", { name: "Privacy & Data" }).boundingBox();
    expect(privacy!.x).toBeGreaterThan(calc!.x + 200);
  });
});

test.describe("About explains academic standing for each career", () => {
  test("Commercial SE has a SAP card with both catalog conditions, the consequences and the ESP link", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoAbout(page);

    const heading = page.getByRole("heading", { name: "Satisfactory Academic Progress (SAP)" });
    await expect(heading).toBeVisible();
    const main = page.locator("main");
    await expect(main).toContainText("cumulative GPA of at least 2.0 and a rate of progress (ROP) of at least 67%");
    await expect(main).toContainText("Academic Warning");
    await expect(main).toContainText("failing an ESP course three times also dismisses you from your Software Engineering degree");
  });

  test("ESP says SAP does not apply and lists its own rules", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page);

    await expect(page.getByRole("heading", { name: "Academic standing in ESP" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Satisfactory Academic Progress (SAP)" })).toHaveCount(0);
    const main = page.locator("main");
    await expect(main).toContainText("SAP does not apply to ESP");
    await expect(main).toContainText("Labs can't be retaken");
    await expect(main).toContainText("dismissal from the ESP program and, at the same time, from your Software Engineering degree");
  });

  test("the standing card is translated", async ({ page }) => {
    await seedProfile(page, { career: "esp" });
    await gotoAbout(page, "es");
    await expect(page.getByRole("heading", { name: "Situación académica en ESP" })).toBeVisible();
    await gotoAbout(page, "pt");
    await expect(page.getByRole("heading", { name: "Situação acadêmica no ESP" })).toBeVisible();
  });
});

