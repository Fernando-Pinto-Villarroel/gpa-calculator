import path from "path";
import { test, expect } from "@playwright/test";
import { seedProfile, gotoPlayground } from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

async function openCanvasImportDialog(page: import("@playwright/test").Page, file: string) {
  await page.locator('[data-tour="playground-actions-menu"]').click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator('[data-tour="playground-action-import-canvas"]').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(file);
  await expect(page.getByText(/Found \d+ groups and \d+ assignments/)).toBeVisible({
    timeout: 15_000,
  });
}

test.describe("Playground - real Canvas print-grades PDF imports", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoPlayground(page);
  });

  test("ES export: Proyectos de Software y Startups (CSRP-486)", async ({ page }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Proyectos de Software y Startups - CSRP-486.pdf",
      ),
    );
    const dialogText = await page.locator(".swal2-html-container").innerText();
    const match = dialogText.match(/Found (\d+) groups and (\d+) assignments/);
    expect(Number(match?.[1])).toBeGreaterThan(0);
    expect(Number(match?.[2])).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Yes, import" }).click();
    await expect(page.getByText("Course Imported")).toBeVisible();
    await expect(page.locator('[data-tour="playground-title"]')).toContainText("Proyectos");
  });

  test("ES export: Arquitectura de software 3 (CSAR-484)", async ({ page }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Arquitectura de software 3 - CSAR-484.pdf",
      ),
    );
    await page.getByRole("button", { name: "Yes, import" }).click();
    await expect(page.getByText("Course Imported")).toBeVisible();
  });

  test("EN export: Software Architecture 3 (CSAR-484)", async ({ page }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Grades for Fernando Pinto Villarroel_ [Completed - ES] - Software Architecture 3 - CSAR-484.pdf",
      ),
    );
    await page.getByRole("button", { name: "Yes, import" }).click();
    await expect(page.getByText("Course Imported")).toBeVisible();
  });

  test("PT export: Arquitetura de Software 3 (CSAR-484)", async ({ page }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Notas para Fernando Pinto Villarroel_ [Concluído - ES] - Arquitetura de Software 3 - CSAR-484.pdf",
      ),
    );
    await page.getByRole("button", { name: "Yes, import" }).click();
    await expect(page.getByText("Course Imported")).toBeVisible();
  });

  test("all three CSAR-484 language variants agree on assignment count (26)", async ({
    context,
  }) => {
    // Group counts legitimately differ between variants: Canvas's own export
    // has a documented mid-document language-mixing glitch where a handful of
    // rows in the "EN"/"PT" exports render in Spanish, producing extra
    // Spanish-labeled group duplicates alongside the real ones. Assignment
    // count has no such ambiguity and must match exactly across languages.
    const counts: number[] = [];
    for (const file of [
      "Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Arquitectura de software 3 - CSAR-484.pdf",
      "Grades for Fernando Pinto Villarroel_ [Completed - ES] - Software Architecture 3 - CSAR-484.pdf",
      "Notas para Fernando Pinto Villarroel_ [Concluído - ES] - Arquitetura de Software 3 - CSAR-484.pdf",
    ]) {
      const p = await context.newPage();
      await seedProfile(p);
      await gotoPlayground(p);
      await openCanvasImportDialog(p, path.join(TEST_DATA, file));
      const dialogText = await p.locator(".swal2-html-container").innerText();
      const match = dialogText.match(/Found \d+ groups and (\d+) assignments/);
      counts.push(Number(match?.[1]));
      await p.close();
    }

    expect(counts).toEqual([26, 26, 26]);
  });

  test("ES export produces exactly 6 clean weight groups (no merged group names)", async ({
    page,
  }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Arquitectura de software 3 - CSAR-484.pdf",
      ),
    );
    const dialogText = await page.locator(".swal2-html-container").innerText();
    expect(dialogText).toMatch(/Found 6 groups and 26 assignments/);
  });

  test("canceling the Canvas import leaves the default course untouched", async ({ page }) => {
    await openCanvasImportDialog(
      page,
      path.join(
        TEST_DATA,
        "Calificaciones para Fernando Pinto Villarroel_ [Concluido - ES] - Proyectos de Software y Startups - CSRP-486.pdf",
      ),
    );
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Untitled Course")).toBeVisible();
  });

  test("rejects a file that isn't a PDF", async ({ page }) => {
    await page.locator('[data-tour="playground-actions-menu"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.locator('[data-tour="playground-action-import-canvas"]').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("just some text"),
    });

    await expect(page.getByText("Please upload a PDF file.")).toBeVisible();
  });
});
