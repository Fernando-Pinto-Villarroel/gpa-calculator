import { LetterGrade, ALL_GRADES } from "@/core/domain/types/letterGrades";
import { CourseGradeEntry, CourseAttempt } from "@/core/domain/types/grades";
import { getCohortById } from "@/features/gpa/data/software-engineering-design-architecture";
import { getEspCohortById } from "@/features/gpa/data/esp";

export interface SplitImportPayload {
  cohortId: string;
  commercialGrades: Record<string, CourseGradeEntry> | null;
  espGrades: Record<string, CourseGradeEntry> | null;
}

export type SplitImportError =
  | { code: "missing_fields" }
  | { code: "unknown_cohort"; cohortId: string }
  | { code: "invalid_grades" }
  | { code: "no_matching_courses" };

export type SplitImportResult =
  | { valid: true; data: SplitImportPayload }
  | { valid: false; error: SplitImportError };

const validGradeSet = new Set<string>(ALL_GRADES);

function isValidAttempt(value: unknown): value is CourseAttempt {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const obj = value as Record<string, unknown>;
  const validGrade =
    obj.grade === null || (typeof obj.grade === "string" && validGradeSet.has(obj.grade));
  return (
    typeof obj.credits === "number" &&
    Number.isInteger(obj.credits) &&
    obj.credits >= 0 &&
    obj.credits <= 4 &&
    validGrade &&
    typeof obj.approved === "boolean"
  );
}

function isValidGradeEntry(value: unknown): value is CourseGradeEntry {
  if (value === null) return true;
  if (typeof value === "string") return validGradeSet.has(value as LetterGrade);
  if (Array.isArray(value)) return value.every(isValidAttempt);
  return false;
}

function courseCodesForCohort(
  getCohort: (id: string) => { terms: { modules: Record<string, { courseCode: string }[]> }[] } | undefined,
  cohortId: string,
): Set<string> | null {
  const cohort = getCohort(cohortId);
  if (!cohort) return null;
  const codes = new Set<string>();
  cohort.terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((c) => codes.add(c.courseCode));
    });
  });
  return codes;
}

/**
 * A backup's cohortId (e.g. "cohort-2-2026") exists as a valid id in BOTH
 * the Commercial SE and ESP cohort registries, since both programs enroll
 * by the same academic year. A cohortId match alone can't tell which
 * program a backup belongs to — only its course codes can. This splits a
 * backup's grades by which program's course codes they actually match, so
 * a same-program restore behaves as before, an accidental cross-program
 * import routes to the right store instead of silently wiping the wrong
 * one, and a backup covering both programs (as SIS PDF import already
 * produces) restores both at once.
 */
export function splitImportPayload(raw: unknown): SplitImportResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { valid: false, error: { code: "missing_fields" } };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.cohortId !== "string" || obj.cohortId.trim() === "") {
    return { valid: false, error: { code: "missing_fields" } };
  }
  const cohortId = obj.cohortId;

  const commercialCodes = courseCodesForCohort(getCohortById, cohortId);
  const espCodes = courseCodesForCohort(getEspCohortById, cohortId);
  if (!commercialCodes && !espCodes) {
    return { valid: false, error: { code: "unknown_cohort", cohortId } };
  }

  if (typeof obj.grades !== "object" || obj.grades === null || Array.isArray(obj.grades)) {
    return { valid: false, error: { code: "missing_fields" } };
  }
  const rawGrades = obj.grades as Record<string, unknown>;

  const commercialGrades: Record<string, CourseGradeEntry> = {};
  const espGrades: Record<string, CourseGradeEntry> = {};

  for (const [courseCode, value] of Object.entries(rawGrades)) {
    if (!isValidGradeEntry(value)) {
      return { valid: false, error: { code: "invalid_grades" } };
    }
    if (commercialCodes?.has(courseCode)) {
      commercialGrades[courseCode] = value;
    } else if (espCodes?.has(courseCode)) {
      espGrades[courseCode] = value;
    }
  }

  const hasCommercial = Object.keys(commercialGrades).length > 0;
  const hasEsp = Object.keys(espGrades).length > 0;

  if (!hasCommercial && !hasEsp) {
    return { valid: false, error: { code: "no_matching_courses" } };
  }

  return {
    valid: true,
    data: {
      cohortId,
      commercialGrades: hasCommercial ? commercialGrades : null,
      espGrades: hasEsp ? espGrades : null,
    },
  };
}
