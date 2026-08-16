import { LetterGrade, ALL_GRADES } from "@/core/domain/types/letterGrades";
import {
  CourseGradeEntry,
  CourseAttempt,
} from "@/core/domain/types/grades";
import { getCohortById } from "@/features/gpa/data/software-engineering-design-architecture";

export type ImportPayload = {
  cohortId: string;
  grades: Record<string, CourseGradeEntry>;
};

export type ImportValidationError =
  | { code: "missing_fields" }
  | { code: "unknown_cohort"; cohortId: string }
  | { code: "invalid_grades" };

export type ImportValidationResult =
  | { valid: true; data: ImportPayload }
  | { valid: false; error: ImportValidationError };

const validGradeSet = new Set<string>(ALL_GRADES);

function isValidAttempt(value: unknown): value is CourseAttempt {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const obj = value as Record<string, unknown>;
  const validGrade = obj.grade === null || (typeof obj.grade === "string" && validGradeSet.has(obj.grade));
  return (
    typeof obj.credits === "number" &&
    Number.isInteger(obj.credits) &&
    obj.credits >= 1 &&
    obj.credits <= 4 &&
    validGrade &&
    typeof obj.approved === "boolean"
  );
}

function isValidGradeEntry(value: unknown): value is CourseGradeEntry {
  if (value === null) return true;
  if (typeof value === "string") return validGradeSet.has(value);
  if (Array.isArray(value)) return value.every(isValidAttempt);
  return false;
}

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

  const version = typeof obj.version === "number" ? obj.version : 1;

  if (version === 1) {
    for (const value of Object.values(obj.grades as Record<string, unknown>)) {
      if (value !== null && (typeof value !== "string" || !validGradeSet.has(value as string))) {
        return { valid: false, error: { code: "invalid_grades" } };
      }
    }
  } else {
    for (const value of Object.values(obj.grades as Record<string, unknown>)) {
      if (!isValidGradeEntry(value)) {
        return { valid: false, error: { code: "invalid_grades" } };
      }
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
