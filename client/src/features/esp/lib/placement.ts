import { Course, Term } from "@/core/domain/types/course";
import { CourseGradeEntry, hasGradeData } from "@/core/domain/types/grades";

export type EspPlacementLevel = "1" | "2";

export function isOffPlacementLevel(
  course: Course,
  placementLevel: EspPlacementLevel,
): boolean {
  return !!course.placementTrack && course.placementTrack !== `level-${placementLevel}`;
}

export function getEspTermsForPlacement(
  terms: Term[],
  placementLevel: EspPlacementLevel,
): Term[] {
  return terms
    .map((term) => ({
      ...term,
      modules: Object.fromEntries(
        Object.entries(term.modules).map(([moduleName, courses]) => [
          moduleName,
          courses.filter((course) => !isOffPlacementLevel(course, placementLevel)),
        ]),
      ),
    }))
    .filter((term) =>
      Object.values(term.modules).some((courses) => courses.length > 0),
    );
}

export function inferEspPlacementLevel(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): EspPlacementLevel | null {
  let hasLevel1Data = false;
  let hasLevel2Data = false;

  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        if (!course.placementTrack) return;
        if (!hasGradeData(grades[course.courseCode] ?? null)) return;
        if (course.placementTrack === "level-1") hasLevel1Data = true;
        else hasLevel2Data = true;
      });
    });
  });

  if (hasLevel1Data && !hasLevel2Data) return "1";
  if (hasLevel2Data && !hasLevel1Data) return "2";
  return null;
}

export function isPlacementLevelDetected(
  explicitLevel: EspPlacementLevel | null,
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): boolean {
  return explicitLevel === null && inferEspPlacementLevel(grades, terms) === "2";
}

export const DEFAULT_ESP_PLACEMENT_LEVEL: EspPlacementLevel = "1";

export function resolveEspPlacementLevel(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
  explicitLevel: EspPlacementLevel | null,
): EspPlacementLevel {
  return (
    explicitLevel ??
    inferEspPlacementLevel(grades, terms) ??
    DEFAULT_ESP_PLACEMENT_LEVEL
  );
}

export function getPlacementLevelForImport(
  importedGrades: Record<string, CourseGradeEntry>,
  terms: Term[],
  previousLevel: EspPlacementLevel,
): { level: EspPlacementLevel | null; changed: boolean } {
  const level = inferEspPlacementLevel(importedGrades, terms);
  return { level, changed: level !== null && level !== previousLevel };
}

export function getGradedOffLevelCourses(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
  placementLevel: EspPlacementLevel,
): Course[] {
  return terms
    .flatMap((term) => Object.values(term.modules).flat())
    .filter(
      (course) =>
        isOffPlacementLevel(course, placementLevel) &&
        hasGradeData(grades[course.courseCode] ?? null),
    );
}

export function hasGradesOnBothPlacementLevels(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): boolean {
  return (
    getGradedOffLevelCourses(grades, terms, "1").length > 0 &&
    getGradedOffLevelCourses(grades, terms, "2").length > 0
  );
}
