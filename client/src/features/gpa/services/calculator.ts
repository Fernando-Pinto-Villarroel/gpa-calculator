import { Course, Term } from "@/core/domain/types/course";
import { LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import { terms } from "../data/courseData";

export interface GpaResult {
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  completedCourses: number;
  totalCourses: number;
  remainingCredits: number;
}

export interface TermGpaResult {
  termId: string;
  label: string;
  termGpa: number;
  cumulativeGpa: number;
  earnedCredits: number;
  totalTermCredits: number;
}

export interface CourseWithGrade extends Course {
  grade: LetterGrade | null;
  termLabel: string;
  termId: string;
}

export type HonorStatus =
  | "summa_cum_laude"
  | "magna_cum_laude"
  | "cum_laude"
  | "good_standing"
  | "at_risk"
  | "academic_failure"
  | null;

export function calculateGpa(
  grades: Record<string, LetterGrade | null>
): GpaResult {
  let totalQualityPoints = 0;
  let totalAttemptedCredits = 0;
  let completedCourses = 0;
  let totalCourses = 0;
  let totalCredits = 0;

  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        totalCourses++;
        totalCredits += course.credits;
        const grade = grades[course.courseCode];
        if (grade !== null && grade !== undefined) {
          const points = letterGradesMap[grade];
          totalQualityPoints += points * course.credits;
          totalAttemptedCredits += course.credits;
          completedCourses++;
        }
      });
    });
  });

  const gpa =
    totalAttemptedCredits > 0 ? totalQualityPoints / totalAttemptedCredits : 0;

  return {
    gpa,
    completedCredits: totalAttemptedCredits,
    totalCredits,
    completedCourses,
    totalCourses,
    remainingCredits: totalCredits - totalAttemptedCredits,
  };
}

export function getHonorStatus(gpa: number): HonorStatus {
  if (gpa === 0) return null;
  if (gpa >= 3.8) return "summa_cum_laude";
  if (gpa >= 3.5) return "magna_cum_laude";
  if (gpa >= 3.2) return "cum_laude";
  if (gpa >= 2.0) return "good_standing";
  if (gpa >= 1.5) return "at_risk";
  return "academic_failure";
}

export function getTermGpaProgression(
  grades: Record<string, LetterGrade | null>
): TermGpaResult[] {
  let cumulativeQualityPoints = 0;
  let cumulativeCredits = 0;
  const results: TermGpaResult[] = [];

  terms.forEach((term) => {
    let termQualityPoints = 0;
    let termCredits = 0;
    let termEarned = 0;
    let termTotal = 0;

    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        termTotal += course.credits;
        const grade = grades[course.courseCode];
        if (grade !== null && grade !== undefined) {
          const points = letterGradesMap[grade];
          termQualityPoints += points * course.credits;
          termCredits += course.credits;
          termEarned += course.credits;
        }
      });
    });

    cumulativeQualityPoints += termQualityPoints;
    cumulativeCredits += termCredits;

    const termGpa = termCredits > 0 ? termQualityPoints / termCredits : 0;
    const cumulativeGpa =
      cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : 0;

    if (termCredits > 0) {
      results.push({
        termId: term.id,
        label: term.label,
        termGpa,
        cumulativeGpa,
        earnedCredits: termEarned,
        totalTermCredits: termTotal,
      });
    }
  });

  return results;
}

export function getGradeDistribution(
  grades: Record<string, LetterGrade | null>
): Record<LetterGrade, number> {
  const distribution: Record<string, number> = {};
  Object.values(grades).forEach((grade) => {
    if (grade) {
      distribution[grade] = (distribution[grade] || 0) + 1;
    }
  });
  return distribution as Record<LetterGrade, number>;
}

export function getBestAndWorstCourses(
  grades: Record<string, LetterGrade | null>
): { best: CourseWithGrade | null; worst: CourseWithGrade | null } {
  const coursesWithGrades: CourseWithGrade[] = [];

  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        const grade = grades[course.courseCode];
        if (grade) {
          coursesWithGrades.push({
            ...course,
            grade,
            termLabel: term.label,
            termId: term.id,
          });
        }
      });
    });
  });

  if (coursesWithGrades.length === 0) return { best: null, worst: null };

  const sorted = [...coursesWithGrades].sort(
    (a, b) =>
      letterGradesMap[b.grade!] - letterGradesMap[a.grade!]
  );

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}

export function getCreditsPerTerm(
  grades: Record<string, LetterGrade | null>
): { termLabel: string; earned: number; total: number }[] {
  return terms.map((term) => {
    let earned = 0;
    let total = 0;
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        total += course.credits;
        if (grades[course.courseCode]) earned += course.credits;
      });
    });
    return { termLabel: term.label, earned, total };
  });
}

export function getCompletedTermsCount(
  grades: Record<string, LetterGrade | null>
): number {
  return terms.filter((term) => {
    const allCourses = Object.values(term.modules).flat();
    return allCourses.every((c) => grades[c.courseCode]);
  }).length;
}

export function buildDefaultGrades(): Record<string, LetterGrade | null> {
  const grades: Record<string, LetterGrade | null> = {};
  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        grades[course.courseCode] = null;
      });
    });
  });
  return grades;
}
