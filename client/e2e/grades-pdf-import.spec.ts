import path from "path";
import { test, expect } from "@playwright/test";
import { seedProfile, gotoGrades, readLocalStorageJson } from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

interface EspStoreShape {
  state: { selectedCohortId: string; gradesByCohort: Record<string, Record<string, string | null>> };
}

async function openPdfImportDialog(page: import("@playwright/test").Page, file: string) {
  await page.locator('button[aria-label="Actions"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Import from SIS PDF").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(file);
  await expect(page.getByText(/courses with grades were found/)).toBeVisible({ timeout: 15_000 });
}

async function getEspGrades(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<EspStoreShape>(page, "jala-esp-gpa-store");
  const cohortId = store?.state.selectedCohortId ?? "cohort-2-2026";
  return store?.state.gradesByCohort[cohortId] ?? {};
}

test.describe("Grades - real SIS PDF imports", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("fer.pdf: matches Commercial SE courses and 10 ESP courses", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "fer.pdf"));

    const dialogText = await page.locator(".swal2-html-container").innerText();
    const matched = Number(dialogText.match(/(\d+) courses with grades/)?.[1]);
    expect(matched).toBeGreaterThan(0);
    await expect(page.getByText("Also found 10 ESP course grade(s)")).toBeVisible();

    await page.getByRole("button", { name: "Yes, import grades" }).click();
    await expect(page.getByText(/Grades Imported|Successfully imported/)).toBeVisible();

    const espGrades = await getEspGrades(page);
    expect(espGrades["ESP-501"]).toBe("A");
    expect(espGrades["ESP-401"]).toBe("A");
    expect(espGrades["ESP-201-M3L2"]).toBe("A");
  });

  test("irwin.pdf: matches 10 ESP courses with mixed grades", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "irwin.pdf"));

    await expect(page.getByText("Also found 10 ESP course grade(s)")).toBeVisible();
    await page.getByRole("button", { name: "Yes, import grades" }).click();

    const espGrades = await getEspGrades(page);
    expect(espGrades["ESP-401"]).toBe("C");
    expect(espGrades["ESP-201-M5L2"]).toBe("F");
    expect(espGrades["ESP-301"]).toBe("C+");
    expect(espGrades["ESP-201-M10"]).toBe("B-");
  });

  test("victor.pdf: matches 9 ESP courses", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "victor.pdf"));

    await expect(page.getByText("Also found 9 ESP course grade(s)")).toBeVisible();
    await page.getByRole("button", { name: "Yes, import grades" }).click();

    const espGrades = await getEspGrades(page);
    expect(espGrades["ESP-401"]).toBe("B+");
    expect(espGrades["ESP-201-M10"]).toBe("A-");
    expect(espGrades["ESP-301"]).toBeNull();
  });

  test("samuel.pdf: matches 9 ESP courses including Level 1", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "samuel.pdf"));

    await expect(page.getByText("Also found 9 ESP course grade(s)")).toBeVisible();
    await page.getByRole("button", { name: "Yes, import grades" }).click();

    const espGrades = await getEspGrades(page);
    expect(espGrades["ESP-101"]).toBe("D");
    expect(espGrades["ESP-101-M3L1"]).toBe("C+");
    expect(espGrades["ESP-101-M4L1"]).toBe("D");
    expect(espGrades["ESP-201"]).toBe("C");
    expect(espGrades["ESP-201-M10"]).toBe("F");
    expect(espGrades["ESP-301-M15"]).toBeNull();
  });

  test("sergio.pdf: matches exactly 4 ESP courses (early-progress transcript)", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "sergio.pdf"));

    await expect(page.getByText("Also found 4 ESP course grade(s)")).toBeVisible();
    await page.getByRole("button", { name: "Yes, import grades" }).click();

    const espGrades = await getEspGrades(page);
    expect(espGrades["ESP-201-M7"]).toBe("D");
    expect(espGrades["ESP-201-M5L2"]).toBe("F");
    expect(espGrades["ESP-201-M2L2"]).toBe("D");
    expect(espGrades["ESP-201-M3L2"]).toBe("C");
    expect(Object.keys(espGrades).filter((k) => espGrades[k] !== null)).toHaveLength(4);
  });

  test("canceling the PDF import confirm leaves grades untouched", async ({ page }) => {
    await openPdfImportDialog(page, path.join(TEST_DATA, "fer.pdf"));
    await page.getByRole("button", { name: "Cancel" }).click();

    const espGrades = await getEspGrades(page);
    const gradedCount = Object.values(espGrades).filter((v) => v !== null).length;
    expect(gradedCount).toBe(0);
  });

  test("rejects a file that isn't a PDF", async ({ page }) => {
    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("just some text"),
    });

    await expect(page.getByText("Please select a valid PDF file.")).toBeVisible();
  });

  test("shows a parse error for a corrupted PDF", async ({ page }) => {
    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "corrupted.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 this is not a real pdf stream"),
    });

    await expect(page.getByText(/Could not read the PDF/)).toBeVisible({ timeout: 10_000 });
  });
});
