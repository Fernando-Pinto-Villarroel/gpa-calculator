import { test, expect } from "@playwright/test";
import { seedProfile, gotoDashboard, gotoForecast, switchCareer } from "./fixtures";

// The header has a 300ms color transition; wait it out before reading the
// computed color so we don't capture a mid-animation interpolated value.
async function getBg(page: import("@playwright/test").Page, selector: string) {
  await page.waitForTimeout(400);
  return page
    .locator(selector)
    .first()
    .evaluate((el) => getComputedStyle(el).backgroundColor);
}

test.describe("Header re-themes per career", () => {
  test("Commercial SE keeps the original blue header, ESP switches it to orange", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    const commercialBg = await getBg(page, "header");

    await switchCareer(page, "esp");
    const espBg = await getBg(page, "header");

    expect(espBg).not.toBe(commercialBg);
    // header-bg for esp resolves to #c2410c -> rgb(194, 65, 12)
    expect(espBg).toBe("rgb(194, 65, 12)");
    // header-bg default (commercial) resolves to the existing jala-blue-700 -> #0d49a9
    expect(commercialBg).toBe("rgb(13, 73, 169)");
  });

  test("the header color survives a full reload (no flash of the wrong color)", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);
    await page.reload({ waitUntil: "networkidle" });

    const dataCareer = await page.evaluate(() =>
      document.documentElement.getAttribute("data-career"),
    );
    expect(dataCareer).toBe("esp");

    const bg = await getBg(page, "header");
    expect(bg).toBe("rgb(194, 65, 12)");
  });

  test("switching back to Commercial SE restores the original header color", async ({
    page,
  }) => {
    await seedProfile(page, { career: "esp" });
    await gotoDashboard(page);

    await switchCareer(page, "commercial");
    const bg = await getBg(page, "header");
    expect(bg).toBe("rgb(13, 73, 169)");
  });
});

test.describe("Full app accent re-themes per career, not just the header", () => {
  test("a solid accent button (e.g. 'Enter Grades') switches from blue to orange for ESP", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoDashboard(page);
    const commercialBtn = await getBg(page, "a:has-text('Enter Grades')");
    expect(commercialBtn).toBe("rgb(13, 73, 169)");

    await switchCareer(page, "esp");
    const espBtn = await getBg(page, "a:has-text('Enter Grades')");
    expect(espBtn).toBe("rgb(194, 65, 12)");
  });

  test("an active toggle pill elsewhere in the app (Forecast's scope switcher) also switches accent color", async ({
    page,
  }) => {
    await seedProfile(page);
    await gotoForecast(page);
    const commercialPill = await getBg(page, "button:has-text('Cumulative')");
    expect(commercialPill).toBe("rgb(13, 73, 169)");

    await switchCareer(page, "esp");
    await gotoForecast(page);
    const espPill = await getBg(page, "button:has-text('Cumulative')");
    expect(espPill).toBe("rgb(194, 65, 12)");
  });
});
