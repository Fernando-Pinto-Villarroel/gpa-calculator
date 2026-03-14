import type { LetterGrade } from "@/core/domain/types/letterGrades";
import type { CourseGradeEntry, CourseAttempt } from "@/core/domain/types/grades";
import { ALL_GRADES } from "@/core/domain/types/letterGrades";
import { cohorts, getCohortById } from "@/features/gpa/data";

export type PdfCourseEntry = {
  courseCode: string;
  credits: number;
  grade: LetterGrade;
};

export type CreditOverride = {
  courseCode: string;
  expected: number;
  actual: number;
};

export type PdfParseResult =
  | {
      success: true;
      grades: Record<string, CourseGradeEntry>;
      matched: number;
      skipped: number;
      unrecognized: string[];
      remapped: Array<{ from: string; to: string }>;
      creditOverrides: CreditOverride[];
    }
  | { success: false; error: string };

const VALID_GRADES = new Set<string>(ALL_GRADES);

const FAILING_GRADES = new Set<string>(["F", "D-"]);

function isPassingGrade(grade: LetterGrade): boolean {
  return !FAILING_GRADES.has(grade);
}

function normalizeText(text: string): string {
  return text
    .replace(/([A-Z]{2,4})\s+-\s*(\d{3})/g, "$1-$2")
    .replace(/([A-Z]{2,4})\s*-\s+(\d{3})/g, "$1-$2")
    .replace(/\b([ABCD])\s+([+-])/g, "$1$2")
    .replace(/\b([ABCD])\s*(\+)\s/g, "$1$2 ")
    .replace(/\b([ABCD])\s*(-)\s/g, "$1$2 ");
}

function buildCrossCourseLookup(): Map<string, string> {
  const codeToName = new Map<string, string>();
  for (const cohort of cohorts) {
    for (const term of cohort.terms) {
      for (const courses of Object.values(term.modules)) {
        for (const course of courses) {
          codeToName.set(course.courseCode, course.name);
        }
      }
    }
  }
  return codeToName;
}

function buildNameToCodeMap(cohortId: string): Map<string, string> {
  const nameToCode = new Map<string, string>();
  const cohort = getCohortById(cohortId);
  if (!cohort) return nameToCode;
  for (const term of cohort.terms) {
    for (const courses of Object.values(term.modules)) {
      for (const course of courses) {
        nameToCode.set(course.name, course.courseCode);
      }
    }
  }
  return nameToCode;
}

function buildRemapTable(cohortId: string): Map<string, string> {
  const remap = new Map<string, string>();

  const cohort = getCohortById(cohortId);
  if (!cohort) return remap;

  const cohortCodes = new Set<string>();
  for (const term of cohort.terms) {
    for (const courses of Object.values(term.modules)) {
      for (const course of courses) {
        cohortCodes.add(course.courseCode);
      }
    }
  }

  const globalCodeToName = buildCrossCourseLookup();
  const targetNameToCode = buildNameToCodeMap(cohortId);

  for (const [code, name] of globalCodeToName) {
    if (cohortCodes.has(code)) continue;
    const targetCode = targetNameToCode.get(name);
    if (targetCode && targetCode !== code) {
      remap.set(code, targetCode);
    }
  }

  return remap;
}

function buildCohortCreditsMap(cohortId: string): Map<string, number> {
  const creditsMap = new Map<string, number>();
  const cohort = getCohortById(cohortId);
  if (!cohort) return creditsMap;
  for (const term of cohort.terms) {
    for (const courses of Object.values(term.modules)) {
      for (const course of courses) {
        creditsMap.set(course.courseCode, course.credits);
      }
    }
  }
  return creditsMap;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n");
}

export function parsePdfText(rawText: string): PdfCourseEntry[] {
  const consolidatedIdx = rawText.indexOf("Consolidated");
  const textSlice = consolidatedIdx !== -1 ? rawText.slice(consolidatedIdx) : rawText;
  const text = normalizeText(textSlice);

  const entries: PdfCourseEntry[] = [];

  const gradeAlt = [
    "A-", "B\\+", "B-", "C\\+", "C-", "D\\+", "D-", "A", "B", "C", "D", "F",
  ].join("|");

  const pattern = new RegExp(
    `([A-Z]{2,4}-\\d{3})` +
      `\\s+` +
      `(\\d)` +
      `\\s+` +
      `(${gradeAlt})` +
      `\\s+` +
      `(\\d+\\.\\d{2})`,
    "g",
  );

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const courseCode = match[1];
    const credits = parseInt(match[2], 10);
    const grade = match[3];

    if (courseCode.startsWith("ESP")) continue;
    if (!VALID_GRADES.has(grade)) continue;
    if (credits < 1 || credits > 4) continue;

    entries.push({ courseCode, credits, grade: grade as LetterGrade });
  }

  return entries;
}

export function buildGradesFromPdfEntries(
  entries: PdfCourseEntry[],
  cohortId: string,
): PdfParseResult {
  if (entries.length === 0) {
    return { success: false, error: "no_courses_found" };
  }

  const cohort = getCohortById(cohortId);
  if (!cohort) {
    return { success: false, error: "unknown_cohort" };
  }

  const cohortCodes = new Set<string>();
  for (const term of cohort.terms) {
    for (const courses of Object.values(term.modules)) {
      for (const course of courses) {
        cohortCodes.add(course.courseCode);
      }
    }
  }

  const remapTable = buildRemapTable(cohortId);
  const cohortCredits = buildCohortCreditsMap(cohortId);
  const remapped: Array<{ from: string; to: string }> = [];
  const remappedSet = new Set<string>();

  const grouped = new Map<string, PdfCourseEntry[]>();
  const unrecognizedSet = new Set<string>();

  for (const entry of entries) {
    let targetCode = entry.courseCode;

    if (!cohortCodes.has(targetCode)) {
      const mapped = remapTable.get(targetCode);
      if (mapped) {
        targetCode = mapped;
        if (!remappedSet.has(entry.courseCode)) {
          remappedSet.add(entry.courseCode);
          remapped.push({ from: entry.courseCode, to: mapped });
        }
      } else {
        unrecognizedSet.add(entry.courseCode);
        continue;
      }
    }

    const list = grouped.get(targetCode) ?? [];
    list.push({ ...entry, courseCode: targetCode });
    grouped.set(targetCode, list);
  }

  const grades: Record<string, CourseGradeEntry> = {};
  const creditOverrides: CreditOverride[] = [];
  const creditOverrideSet = new Set<string>();
  let matched = 0;

  for (const [courseCode, courseEntries] of grouped) {
    const expectedCredits = cohortCredits.get(courseCode);

    if (courseEntries.length === 1) {
      const entry = courseEntries[0];
      const hasCreditMismatch =
        expectedCredits !== undefined && entry.credits !== expectedCredits;

      if (hasCreditMismatch) {
        grades[courseCode] = [
          {
            credits: entry.credits,
            grade: entry.grade,
            approved: isPassingGrade(entry.grade),
          },
        ];
        if (!creditOverrideSet.has(courseCode)) {
          creditOverrideSet.add(courseCode);
          creditOverrides.push({
            courseCode,
            expected: expectedCredits,
            actual: entry.credits,
          });
        }
      } else {
        grades[courseCode] = entry.grade;
      }

      matched++;
      continue;
    }

    const reversed = [...courseEntries].reverse();

    let approvedIdx = -1;
    for (let i = reversed.length - 1; i >= 0; i--) {
      if (isPassingGrade(reversed[i].grade)) {
        approvedIdx = i;
        break;
      }
    }

    const attempts: CourseAttempt[] = reversed.map((entry, i) => ({
      credits: entry.credits,
      grade: entry.grade,
      approved: i === approvedIdx,
    }));

    grades[courseCode] = attempts;
    matched++;

    if (expectedCredits !== undefined) {
      for (const entry of courseEntries) {
        if (entry.credits !== expectedCredits && !creditOverrideSet.has(courseCode)) {
          creditOverrideSet.add(courseCode);
          creditOverrides.push({
            courseCode,
            expected: expectedCredits,
            actual: entry.credits,
          });
          break;
        }
      }
    }
  }

  return {
    success: true,
    grades,
    matched,
    skipped: entries.length - matched - unrecognizedSet.size,
    unrecognized: [...unrecognizedSet],
    remapped,
    creditOverrides,
  };
}

export async function parsePdfFile(
  file: File,
  cohortId: string,
): Promise<PdfParseResult> {
  const text = await extractTextFromPdf(file);
  const entries = parsePdfText(text);
  return buildGradesFromPdfEntries(entries, cohortId);
}
