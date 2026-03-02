import { LetterGrade, ALL_GRADES } from "@/core/domain/types/letterGrades";
import { getCohortById } from "@/features/gpa/data";

export type ImportPayload = {
  cohortId: string;
  grades: Record<string, LetterGrade | null>;
};

export type ImportValidationError =
  | { code: "missing_fields" }
  | { code: "unknown_cohort"; cohortId: string }
  | { code: "invalid_grades" };

export type ImportValidationResult =
  | { valid: true; data: ImportPayload }
  | { valid: false; error: ImportValidationError };

export function validateImportPayload(raw: unknown): ImportValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { valid: false, error: { code: "missing_fields" } };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.cohortId !== "string" || obj.cohortId.trim() === "") {
    return { valid: false, error: { code: "missing_fields" } };
  }

  if (!getCohortById(obj.cohortId)) {
    return {
      valid: false,
      error: { code: "unknown_cohort", cohortId: obj.cohortId },
    };
  }

  if (
    typeof obj.grades !== "object" ||
    obj.grades === null ||
    Array.isArray(obj.grades)
  ) {
    return { valid: false, error: { code: "missing_fields" } };
  }

  const validGradeSet = new Set<string>(ALL_GRADES);
  for (const value of Object.values(obj.grades as Record<string, unknown>)) {
    if (value !== null && !validGradeSet.has(value as string)) {
      return { valid: false, error: { code: "invalid_grades" } };
    }
  }

  return {
    valid: true,
    data: {
      cohortId: obj.cohortId,
      grades: obj.grades as Record<string, LetterGrade | null>,
    },
  };
}
