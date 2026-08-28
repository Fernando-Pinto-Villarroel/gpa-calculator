import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";

// A translation key that exists in one locale file but not another causes
// next-intl to fall back to rendering the raw key path (or throw, depending
// on config) only in that specific locale — something no page-by-page E2E
// test reliably catches unless it happens to visit that exact locale and
// component. Comparing the flattened key sets directly is exhaustive and
// doesn't need a browser.
function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys = keys.concat(flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function loadKeys(locale: string): Set<string> {
  const file = path.resolve(__dirname, `../messages/${locale}.json`);
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  return new Set(flattenKeys(parsed));
}

function flattenStrings(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  let out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out = { ...out, ...flattenStrings(v as Record<string, unknown>, full) };
    } else if (typeof v === "string") {
      out[full] = v;
    }
  }
  return out;
}

function loadStrings(locale: string): Record<string, string> {
  const file = path.resolve(__dirname, `../messages/${locale}.json`);
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  return flattenStrings(parsed);
}

function placeholdersIn(str: string): string {
  return [...new Set(str.match(/\{[a-zA-Z0-9_]+\}/g) ?? [])].sort().join(",");
}

test.describe("Translation files stay in sync across locales", () => {
  test("en, es, and pt define exactly the same set of message keys", () => {
    const en = loadKeys("en");
    const es = loadKeys("es");
    const pt = loadKeys("pt");

    const missingFromEs = [...en].filter((k) => !es.has(k));
    const missingFromPt = [...en].filter((k) => !pt.has(k));
    const extraInEs = [...es].filter((k) => !en.has(k));
    const extraInPt = [...pt].filter((k) => !en.has(k));

    expect(missingFromEs, "keys in en.json missing from es.json").toEqual([]);
    expect(missingFromPt, "keys in en.json missing from pt.json").toEqual([]);
    expect(extraInEs, "keys in es.json not present in en.json").toEqual([]);
    expect(extraInPt, "keys in pt.json not present in en.json").toEqual([]);
  });

  // A key can exist in every locale (caught above) while still having a
  // typo'd or missing {placeholder} in one translation — e.g. {cohortId}
  // in en.json but {cohortid} in pt.json — which next-intl won't interpolate,
  // silently leaving the literal "{cohortId}" in the rendered text for that
  // locale only.
  test("every message's {placeholders} match exactly across en, es, and pt", () => {
    const en = loadStrings("en");
    const es = loadStrings("es");
    const pt = loadStrings("pt");

    const mismatches: string[] = [];
    for (const key of Object.keys(en)) {
      const enPh = placeholdersIn(en[key]);
      const esPh = placeholdersIn(es[key] ?? "");
      const ptPh = placeholdersIn(pt[key] ?? "");
      if (enPh !== esPh || enPh !== ptPh) {
        mismatches.push(`${key}: en=[${enPh}] es=[${esPh}] pt=[${ptPh}]`);
      }
    }

    expect(mismatches).toEqual([]);
  });
});
