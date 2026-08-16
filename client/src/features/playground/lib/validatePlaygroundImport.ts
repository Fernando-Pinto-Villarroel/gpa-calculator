import { PlaygroundAssignment, PlaygroundAssignmentGroup, PlaygroundCourse } from "../types";

export type PlaygroundImportPayload = { version: number; course: PlaygroundCourse };

export type PlaygroundImportValidationError = { code: "invalid_format" };

export type PlaygroundImportValidationResult =
  | { valid: true; data: PlaygroundImportPayload }
  | { valid: false; error: PlaygroundImportValidationError };

function isValidGroup(value: unknown): value is PlaygroundAssignmentGroup {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.weightPercent === "number"
  );
}

function isValidAssignment(value: unknown): value is PlaygroundAssignment {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.groupId === "string" &&
    typeof obj.name === "string" &&
    (obj.score === null || typeof obj.score === "number") &&
    (obj.maxPoints === null || typeof obj.maxPoints === "number")
  );
}

export function validatePlaygroundImport(raw: unknown): PlaygroundImportValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { valid: false, error: { code: "invalid_format" } };
  }

  const obj = raw as Record<string, unknown>;
  const course = obj.course;

  if (typeof course !== "object" || course === null || Array.isArray(course)) {
    return { valid: false, error: { code: "invalid_format" } };
  }

  const c = course as Record<string, unknown>;

  if (typeof c.title !== "string") {
    return { valid: false, error: { code: "invalid_format" } };
  }
  if (!Array.isArray(c.groups) || !c.groups.every(isValidGroup)) {
    return { valid: false, error: { code: "invalid_format" } };
  }
  if (!Array.isArray(c.assignments) || !c.assignments.every(isValidAssignment)) {
    return { valid: false, error: { code: "invalid_format" } };
  }

  return {
    valid: true,
    data: {
      version: typeof obj.version === "number" ? obj.version : 1,
      course: course as PlaygroundCourse,
    },
  };
}
