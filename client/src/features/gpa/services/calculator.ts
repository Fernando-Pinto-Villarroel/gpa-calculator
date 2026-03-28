import { Course, Term } from "@/core/domain/types/course";
import { LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import {
  CourseGradeEntry,
  isCourseAttempts,
  isCourseApproved,
  hasGradeData,
  getEffectiveGrade,
  getApprovedCredits,
  getEffectiveCredits,
} from "@/core/domain/types/grades";

export interface GpaResult {
  gpa: number;
  completedCredits: number;
  approvedCredits: number;
  totalCredits: number;
  completedCourses: number;
  approvedCourses: number;
  totalCourses: number;
  remainingCredits: number;
}

export interface TermGpaResult {
  termId: string;
  termOrdinal: string;
  termGpa: number;
  cumulativeGpa: number;
  earnedCredits: number;
  totalTermCredits: number;
}

export interface CourseWithGrade extends Course {
  grade: LetterGrade | null;
  termOrdinal: string;
  termId: string;
}

export type HonorStatus =
  | "summa_cum_laude"
  | "magna_cum_laude"
  | "cum_laude"
  | "good_standing"
  | "at_risk"
  | "sap_risk"
  | null;

function computeQualityPointsAndCredits(entry: CourseGradeEntry, curriculumCredits: number): {
  qualityPoints: number;
  attemptedCredits: number;
} {
  if (!hasGradeData(entry)) return { qualityPoints: 0, attemptedCredits: 0 };

  if (isCourseAttempts(entry)) {
    let qp = 0;
    let ac = 0;
    entry.forEach((attempt) => {
      if (attempt.grade === null) return;
      qp += letterGradesMap[attempt.grade] * attempt.credits;
      ac += attempt.credits;
    });
    return { qualityPoints: qp, attemptedCredits: ac };
  }

  const grade = entry as LetterGrade;
  return {
    qualityPoints: letterGradesMap[grade] * curriculumCredits,
    attemptedCredits: curriculumCredits,
  };
}

export function calculateGpa(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): GpaResult {
  let totalQualityPoints = 0;
  let totalAttemptedCredits = 0;
  let completedCourses = 0;
  let approvedCourses = 0;
  let completedCredits = 0;
  let approvedCredits = 0;
  let totalCourses = 0;
  let totalCredits = 0;

  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        totalCourses++;

        const entry = grades[course.courseCode];
        const effectiveCredits = getEffectiveCredits(entry, course.credits);

        totalCredits += effectiveCredits;

        if (hasGradeData(entry)) {
          const { qualityPoints, attemptedCredits } = computeQualityPointsAndCredits(
            entry,
            course.credits,
          );
          totalQualityPoints += qualityPoints;
          totalAttemptedCredits += attemptedCredits;
          completedCourses++;
          completedCredits += effectiveCredits;
        }

        if (isCourseApproved(entry)) {
          approvedCourses++;
          approvedCredits += getApprovedCredits(entry, course.credits);
        }
      });
    });
  });

  const gpa =
    totalAttemptedCredits > 0 ? totalQualityPoints / totalAttemptedCredits : 0;

  return {
    gpa,
    completedCredits,
    approvedCredits,
    totalCredits,
    completedCourses,
    approvedCourses,
    totalCourses,
    remainingCredits: totalCredits - completedCredits,
  };
}

export function getHonorStatus(gpa: number): HonorStatus {
  if (gpa === 0) return null;
  if (gpa >= 3.8) return "summa_cum_laude";
  if (gpa >= 3.5) return "magna_cum_laude";
  if (gpa >= 3.2) return "cum_laude";
  if (gpa > 2.5) return "good_standing";
  if (gpa >= 2.0) return "at_risk";
  return "sap_risk";
}

export function getTermGpaProgression(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): TermGpaResult[] {
  let cumulativeQualityPoints = 0;
  let cumulativeCredits = 0;
  const results: TermGpaResult[] = [];

  terms.forEach((term) => {
    let termQualityPoints = 0;
    let termAttemptedCredits = 0;
    let termEarned = 0;
    let termTotal = 0;

    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        const entry = grades[course.courseCode];
        termTotal += getEffectiveCredits(entry, course.credits);

        if (hasGradeData(entry)) {
          const { qualityPoints, attemptedCredits } = computeQualityPointsAndCredits(
            entry,
            course.credits,
          );
          termQualityPoints += qualityPoints;
          termAttemptedCredits += attemptedCredits;
          termEarned += isCourseApproved(entry)
            ? getApprovedCredits(entry, course.credits)
            : 0;
        }
      });
    });

    cumulativeQualityPoints += termQualityPoints;
    cumulativeCredits += termAttemptedCredits;

    const termGpa = termAttemptedCredits > 0 ? termQualityPoints / termAttemptedCredits : 0;
    const cumulativeGpa =
      cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : 0;

    if (termAttemptedCredits > 0) {
      results.push({
        termId: term.id,
        termOrdinal: term.ordinal,
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
  grades: Record<string, CourseGradeEntry>,
): Record<LetterGrade, number> {
  const distribution: Record<string, number> = {};

  Object.values(grades).forEach((entry) => {
    if (!hasGradeData(entry)) return;

    if (isCourseAttempts(entry)) {
      entry.forEach((attempt) => {
        if (attempt.grade === null) return;
        distribution[attempt.grade] = (distribution[attempt.grade] || 0) + 1;
      });
    } else if (entry !== null) {
      distribution[entry] = (distribution[entry] || 0) + 1;
    }
  });

  return distribution as Record<LetterGrade, number>;
}

export function getBestAndWorstCourses(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): {
  best: CourseWithGrade | null;
  worst: CourseWithGrade | null;
  bestCourses: CourseWithGrade[];
  worstCourses: CourseWithGrade[];
} {
  const coursesWithGrades: CourseWithGrade[] = [];

  terms.forEach((term) => {
    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        const entry = grades[course.courseCode];
        const effectiveGrade = getEffectiveGrade(entry);
        if (effectiveGrade) {
          coursesWithGrades.push({
            ...course,
            grade: effectiveGrade,
            termOrdinal: term.ordinal,
            termId: term.id,
          });
        }
      });
    });
  });

  if (coursesWithGrades.length === 0)
    return {
      best: null,
      worst: null,
      bestCourses: [],
      worstCourses: [],
    };

  const sorted = [...coursesWithGrades].sort(
    (a, b) => letterGradesMap[b.grade!] - letterGradesMap[a.grade!],
  );

  const bestGrade = sorted[0].grade;
  const worstGrade = sorted[sorted.length - 1].grade;

  const bestCourses = coursesWithGrades.filter((c) => c.grade === bestGrade);
  const worstCourses = coursesWithGrades.filter((c) => c.grade === worstGrade);

  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
    bestCourses,
    worstCourses,
  };
}

export interface TermCreditsData {
  termOrdinal: string;
  earned: number;
  total: number;
  coursesCompleted: number;
  coursesPending: number;
  totalCourses: number;
}

export function getCreditsPerTerm(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): TermCreditsData[] {
  return terms.map((term) => {
    let earned = 0;
    let total = 0;
    let coursesCompleted = 0;
    let coursesPending = 0;
    let totalCourses = 0;

    Object.values(term.modules).forEach((courses) => {
      courses.forEach((course) => {
        totalCourses++;
        const entry = grades[course.courseCode];
        const approved = isCourseApproved(entry);

        total += getEffectiveCredits(entry, course.credits);

        if (approved) {
          earned += getApprovedCredits(entry, course.credits);
          coursesCompleted++;
        } else {
          coursesPending++;
        }
      });
    });

    return { termOrdinal: term.ordinal, earned, total, coursesCompleted, coursesPending, totalCourses };
  });
}

export function getCompletedTermsCount(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): number {
  return terms.filter((term) => {
    const allCourses = Object.values(term.modules).flat();
    return allCourses.every((c) => isCourseApproved(grades[c.courseCode]));
  }).length;
}

export type TermHonor = "deans_list" | "presidents_list";

export function calculateTermGpa(
  grades: Record<string, CourseGradeEntry>,
  term: Term,
): number {
  const allCourses = Object.values(term.modules).flat();
  if (allCourses.length === 0) return 0;

  let totalQualityPoints = 0;
  let totalAttemptedCredits = 0;

  allCourses.forEach((course) => {
    const entry = grades[course.courseCode];
    if (hasGradeData(entry)) {
      const { qualityPoints, attemptedCredits } = computeQualityPointsAndCredits(
        entry,
        course.credits,
      );
      totalQualityPoints += qualityPoints;
      totalAttemptedCredits += attemptedCredits;
    }
  });

  return totalAttemptedCredits > 0 ? totalQualityPoints / totalAttemptedCredits : 0;
}

export function getTermHonor(
  grades: Record<string, CourseGradeEntry>,
  term: Term,
): TermHonor | null {
  const allCourses = Object.values(term.modules).flat();
  if (allCourses.length === 0) return null;

  const allHaveGrades = allCourses.every((c) => hasGradeData(grades[c.courseCode]));
  if (!allHaveGrades) return null;

  const termGpa = calculateTermGpa(grades, term);

  if (termGpa >= 4.0) return "presidents_list";
  if (termGpa >= 3.5) return "deans_list";
  return null;
}

export function getTermHonorCounts(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): { deansListCount: number; presidentsListCount: number } {
  let deansListCount = 0;
  let presidentsListCount = 0;
  terms.forEach((term) => {
    const honor = getTermHonor(grades, term);
    if (honor === "deans_list") deansListCount++;
    else if (honor === "presidents_list") presidentsListCount++;
  });
  return { deansListCount, presidentsListCount };
}

export function buildDefaultGradesForTerms(
  terms: Term[],
): Record<string, LetterGrade | null> {
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
