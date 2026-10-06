import fs from "fs";
import path from "path";
import { test, expect, Page } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  readLocalStorageJson,
  switchCareer,
} from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");
const HEADER = [
  "No.",
  "Course",
  "Course code",
  "Credits / Hours",
  "Final Score",
  "Grade Points",
].join("\t");

type Row = [
  name: string,
  code: string,
  credits: string,
  grade: string,
  points: string,
];

function block(term: string, rows: Row[]) {
  const lines = rows.map((row, i) => [String(i + 1), ...row].join("\t"));
  return [
    `${term}.(July to December)`,
    HEADER,
    ...lines,
    "Attempted Credits / Hours\t3",
    "GPA\t0.70",
  ].join("\n");
}

function sisText(blocks: string[]) {
  return [
    "Logo",
    "Jala University",
    "Modules",
    "(ES) CSE Term 1 - Group A",
    "T2.26.(July to December)",
    "Consolidated",
    "Report Cards",
    "",
    "Student Name",
    "STU-0000",
    "",
    "Report Card",
    ...blocks,
    "Comment Block",
    "Signature",
  ].join("\n");
}

const STUDENT_TEXT = sisText([
  block("T2.26", [
    ["Lógica", "MATH-111", "3", "D-", "2.10"],
    ["Matemática Discreta", "MATH-112", "3", "", "-"],
    ["Sistemas operativos 1", "CSOS-112", "2", "", "-"],
  ]),
  block("T2.26", [["Programación 1", "CSPR-111", "2", "D+", "2.60"]]),
  block("T2.26", [
    [
      "ESP 2 – Beginning English for Software Engineers II",
      "ESP-201",
      "",
      "",
      "-",
    ],
  ]),
  block("T2.26", [["Lab M4L1", "ESP-101-M4L1", "", "C-", "-"]]),
  block("T1.26", [
    ["Lógica", "MATH-111", "3", "D-", "2.10"],
    ["Programación 1", "CSPR-111", "2", "D-", "1.40"],
    ["Historia de la Ingeniería de Software", "HIST-111", "2", "A-", "7.40"],
    ["Sistemas operativos 1", "CSOS-112", "2", "F", "0.00"],
    ["Base de datos 1", "CSDB-112", "2", "F", "0.00"],
  ]),
  block("T1.26", [
    ["Matemática Discreta", "MATH-112", "3", "F", "0.00"],
    ["Cálculo I", "MATH-113", "3", "F", "0.00"],
  ]),
  block("T1.26", [
    [
      "ESP 1 – Beginning English for Software Engineers I",
      "ESP-101",
      "",
      "C-",
      "-",
    ],
  ]),
  block("T1.26", [["Lab M3L1", "ESP-101-M3L1", "", "C+", "-"]]),
]);

interface CommercialShape {
  state: { gradesByCohort: Record<string, Record<string, unknown>> };
}
interface EspShape {
  state: {
    selectedCohortId: string;
    gradesByCohort: Record<string, Record<string, unknown>>;
    placementLevelByCohort: Record<string, string | null>;
  };
}

async function readCommercial(page: Page) {
  const store = await readLocalStorageJson<CommercialShape>(
    page,
    "jala-gpa-store",
  );
  return store?.state.gradesByCohort["cohort-2-2026"] ?? {};
}

async function readEsp(page: Page) {
  const store = await readLocalStorageJson<EspShape>(
    page,
    "jala-esp-gpa-store",
  );
  const cohortId = store!.state.selectedCohortId;
  return {
    grades: store!.state.gradesByCohort[cohortId] ?? {},
    level: store!.state.placementLevelByCohort[cohortId],
  };
}

async function openPasteDialog(page: Page) {
  await page.locator('button[aria-label="Actions"]').click();
  await page.getByText("Import SIS grades").click();
  await expect(page.locator(".swal2-popup")).toContainText("Ctrl+P");
  await page.getByRole("button", { name: "Paste text" }).click();
  await expect(page.locator(".swal2-textarea")).toBeVisible();
}

async function pasteAndConfirm(page: Page, text: string) {
  await openPasteDialog(page);
  await page.locator(".swal2-textarea").fill(text);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Yes, import grades" }).click();
  await expect(page.getByText("Grades Imported")).toBeVisible();
}

test.describe("SIS import by pasting the copied page", () => {
  test("from the Commercial SE page: imports both programs and replaces the cohort", async ({
    page,
  }) => {
    await seedProfile(page);
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded-paste")) return;
      sessionStorage.setItem("seeded-paste", "1");
      localStorage.setItem(
        "jala-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: { "cohort-2-2026": { "CSPR-471": "B+" } },
            selectedCohortId: "cohort-2-2026",
          },
          version: 0,
        }),
      );
      localStorage.setItem(
        "jala-esp-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: { "cohort-2-2026": { "ESP-501": "B" } },
            selectedCohortId: "cohort-2-2026",
            placementLevelByCohort: {},
          },
          version: 0,
        }),
      );
    });
    await gotoGrades(page);
    await pasteAndConfirm(page, STUDENT_TEXT);

    const commercial = await readCommercial(page);
    expect(commercial["HIST-111"]).toBe("A-");
    expect(commercial["CSPR-471"]).toBeUndefined();
    expect(Array.isArray(commercial["MATH-111"])).toBe(true);
    expect(commercial["MATH-112"]).toBe("F");

    const esp = await readEsp(page);
    expect(esp.grades["ESP-101"]).toBe("C-");
    expect(esp.grades["ESP-101-M3L1"]).toBe("C+");
    expect(esp.grades["ESP-101-M4L1"]).toBe("C-");
    expect(esp.grades["ESP-501"]).toBeUndefined();
    expect(esp.grades["ESP-201"] ?? null).toBeNull();
    expect(esp.level).toBe("1");
  });

  test("from the ESP page the same text gives the same grades", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await pasteAndConfirm(page, STUDENT_TEXT);
    const fromCommercial = {
      commercial: await readCommercial(page),
      esp: await readEsp(page),
    };

    await page.evaluate(() => localStorage.clear());
    await seedProfile(page, { career: "esp" });
    await page.reload({ waitUntil: "networkidle" });
    await switchCareer(page, "esp");
    await gotoGrades(page);
    await pasteAndConfirm(page, STUDENT_TEXT);
    const fromEsp = {
      commercial: await readCommercial(page),
      esp: await readEsp(page),
    };

    expect(fromEsp).toEqual(fromCommercial);
  });

  test("an empty box is refused and text with no grades explains what to copy", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await openPasteDialog(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Paste the text first.")).toBeVisible();

    await page
      .locator(".swal2-textarea")
      .fill("hello, this is not a report card");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(
      page.getByText(
        /No courses with valid grades were found in the pasted text/,
      ),
    ).toBeVisible();
  });

  test("the picker explains both options and cancelling changes nothing", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoGrades(page);
    await page.locator('button[aria-label="Actions"]').click();
    await page.getByText("Import SIS grades").click();
    const dialog = page.locator(".swal2-popup");
    await expect(dialog).toContainText('Do not use "Microsoft Print to PDF"');
    await expect(dialog).toContainText("Ctrl+A");
    await expect(dialog).not.toContainText("Shift");
    await page.getByRole("button", { name: "Cancel" }).click();
    expect(
      Object.values(await readCommercial(page)).filter(
        (grade) => grade !== null,
      ),
    ).toHaveLength(0);
  });
});

test.describe("A PDF saved without readable text", () => {
  const joseFile = path.join(TEST_DATA, "jose.pdf");

  test("explains Microsoft Print to PDF and points to Save as PDF or pasting", async ({
    page,
  }) => {
    test.skip(!fs.existsSync(joseFile), "needs test-data/jose.pdf");
    await seedProfile(page);
    await gotoGrades(page);
    await page.locator('button[aria-label="Actions"]').click();
    const chooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import SIS grades").click();
    await page.getByRole("button", { name: "Upload PDF" }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(joseFile);
    await expect(page.getByText(/no readable text/)).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByText(/Microsoft Print to PDF/).first(),
    ).toBeVisible();
  });
});
