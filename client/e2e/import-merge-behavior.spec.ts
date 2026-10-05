import path from "path";
import { test, expect } from "@playwright/test";
import {
  seedProfile,
  gotoGrades,
  readLocalStorageJson,
  switchCareer,
} from "./fixtures";

const TEST_DATA = path.resolve(__dirname, "../../test-data");

interface CommercialStoreShape {
  state: { gradesByCohort: Record<string, Record<string, unknown>> };
}
interface EspStoreShape {
  state: {
    selectedCohortId: string;
    gradesByCohort: Record<string, Record<string, unknown>>;
  };
}

async function readCommercialGrades(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<CommercialStoreShape>(
    page,
    "jala-gpa-store",
  );
  return store!.state.gradesByCohort["cohort-2-2026"];
}

async function readEspGrades(page: import("@playwright/test").Page) {
  const store = await readLocalStorageJson<EspStoreShape>(
    page,
    "jala-esp-gpa-store",
  );
  const cohortId = store!.state.selectedCohortId;
  return store!.state.gradesByCohort[cohortId];
}

// The PDF confirm dialog promises to replace all the grades of the cohort:
// courses the PDF never mentions are cleared, in both careers, like in v1.
test.describe("SIS PDF import - replaces the whole selected cohort in both careers", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("a manually-graded Commercial SE course the PDF never mentions is cleared by the import", async ({
    page,
  }) => {
    // sergio.pdf ("early-progress transcript") only matches Term I courses.
    // CSPR-471 is a later-term course it never mentions.
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.evaluate(() => {
      const raw = localStorage.getItem("jala-gpa-store");
      const parsed = JSON.parse(raw!);
      parsed.state.gradesByCohort["cohort-2-2026"]["CSPR-471"] = "B+";
      localStorage.setItem("jala-gpa-store", JSON.stringify(parsed));
    });
    await page.reload({ waitUntil: "networkidle" });

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(TEST_DATA, "sergio.pdf"));
    await expect(page.getByText(/courses with grades were found/)).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: "Yes, import grades" }).click();
    await expect(
      page.getByText(/Grades Imported|Successfully imported/),
    ).toBeVisible();

    const grades = await readCommercialGrades(page);
    expect(grades["CSPR-471"]).toBeUndefined();
    expect(grades["CSPR-111"]).toBeDefined();
  });

  test("a manually-graded ESP course the PDF never mentions is cleared by the import", async ({
    page,
  }) => {
    // sergio.pdf matches exactly ESP-201-M7, ESP-201-M5L2, ESP-201-M2L2,
    // ESP-201-M3L2. ESP-501 is never mentioned.
    await switchCareer(page, "esp");
    await gotoGrades(page);
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.evaluate(() => {
      const espRaw = localStorage.getItem("jala-esp-gpa-store");
      const espParsed = JSON.parse(espRaw!);
      const cohortId = espParsed.state.selectedCohortId;
      espParsed.state.gradesByCohort[cohortId]["ESP-501"] = "B";
      localStorage.setItem("jala-esp-gpa-store", JSON.stringify(espParsed));
    });
    await page.reload({ waitUntil: "networkidle" });
    await switchCareer(page, "commercial");
    await gotoGrades(page);

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(TEST_DATA, "sergio.pdf"));
    await expect(
      page.getByText("Also found 4 ESP course grade(s)"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Yes, import grades" }).click();
    await expect(
      page.getByText(/Grades Imported|Successfully imported/),
    ).toBeVisible();

    const espGrades = await readEspGrades(page);
    expect(espGrades["ESP-501"]).toBeUndefined();
    expect(espGrades["ESP-201-M7"]).toBe("D");
  });
});

test.describe("Backup JSON import - intentionally replaces the whole cohort", () => {
  test.beforeEach(async ({ page }) => {
    await seedProfile(page);
    await gotoGrades(page);
  });

  test("importing a backup fully replaces the cohort, including courses the backup omits", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "—" }).first().click();
    await page.getByRole("button", { name: "A", exact: true }).click();
    await page.evaluate(() => {
      const raw = localStorage.getItem("jala-gpa-store");
      const parsed = JSON.parse(raw!);
      parsed.state.gradesByCohort["cohort-2-2026"]["CSPR-471"] = "B+";
      localStorage.setItem("jala-gpa-store", JSON.stringify(parsed));
    });
    await page.reload({ waitUntil: "networkidle" });

    const backupPayload = {
      version: 2,
      cohortId: "cohort-2-2026",
      grades: { "CSPR-111": "C" },
    };

    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import Cohort Backup").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backupPayload)),
    });
    await expect(page.getByText(/will replace/i)).toBeVisible();
    await page.getByRole("button", { name: "Yes, reset it" }).click();

    const grades = await readCommercialGrades(page);
    expect(grades["CSPR-111"]).toBe("C");
    expect(grades["CSPR-471"]).toBeUndefined();
  });
});

test.describe("ESP SIS PDF import lands on the detected level", () => {
  test("a Level 2 transcript replaces the cohort and leaves Level 2 selected", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await page.addInitScript(() => {
      if (sessionStorage.getItem("seeded-esp-import")) return;
      sessionStorage.setItem("seeded-esp-import", "1");
      localStorage.setItem(
        "jala-esp-gpa-store",
        JSON.stringify({
          state: {
            gradesByCohort: {
              "cohort-2-2026": {
                "ESP-101": "A",
                "ESP-101-M3L1": "B",
                "ESP-501": "C",
              },
            },
            selectedCohortId: "cohort-2-2026",
            placementLevelByCohort: { "cohort-2-2026": "1" },
          },
          version: 0,
        }),
      );
    });
    await gotoGrades(page);
    await page.locator('button[aria-label="Actions"]').click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import from SIS PDF").click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(TEST_DATA, "sergio.pdf"));
    await expect(
      page.getByText(/will replace all the existing grades of this cohort/),
    ).toBeVisible({
      timeout: 15000,
    });
    await page.getByRole("button", { name: "Yes, import grades" }).click();
    await expect(
      page.getByText(/Grades Imported|Successfully imported/),
    ).toBeVisible();

    const espGrades = await readEspGrades(page);
    expect(espGrades["ESP-101"]).toBeUndefined();
    expect(espGrades["ESP-501"]).toBeUndefined();
    expect(espGrades["ESP-201-M2L2"]).toBeDefined();

    const store = await readLocalStorageJson<{
      state: { placementLevelByCohort: Record<string, string | null> };
    }>(page, "jala-esp-gpa-store");
    expect(store!.state.placementLevelByCohort["cohort-2-2026"]).toBe("2");
    await expect(
      page.getByRole("button", { name: "Level 2", exact: true }).first(),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
