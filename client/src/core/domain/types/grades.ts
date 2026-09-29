import { LetterGrade, isFailingGrade } from "./letterGrades";

export type CourseAttempt = {
  credits: number;
  grade: LetterGrade | null;
  approved: boolean;
};

export type CourseGradeEntry = LetterGrade | null | CourseAttempt[];

export function isCourseAttempts(entry: CourseGradeEntry): entry is CourseAttempt[] {
  return Array.isArray(entry);
}

export function isCreditOverrideOnly(entry: CourseGradeEntry): boolean {
  return isCourseAttempts(entry) && entry.length === 1 && entry[0].grade === null;
}

export function isApprovedAttempt(attempt: CourseAttempt): boolean {
  return attempt.approved && attempt.grade !== null && !isFailingGrade(attempt.grade);
}

export function getEffectiveGrade(entry: CourseGradeEntry): LetterGrade | null {
  if (entry === null || entry === undefined) return null;
  if (isCourseAttempts(entry)) {
    if (entry.length === 0) return null;
    const approvedAttempt = entry.find(isApprovedAttempt);
    if (approvedAttempt) return approvedAttempt.grade;
    const lastWithGrade = [...entry].reverse().find((a) => a.grade !== null);
    return lastWithGrade?.grade ?? null;
  }
  return entry;
}

export function isCourseApproved(entry: CourseGradeEntry): boolean {
  if (entry === null || entry === undefined) return false;
  if (isCourseAttempts(entry)) return entry.some(isApprovedAttempt);
  return !isFailingGrade(entry);
}

export const MAX_COURSE_ATTEMPTS = 3;

export function countFailedAttempts(entry: CourseGradeEntry): number {
  if (entry === null || entry === undefined) return 0;
  if (isCourseAttempts(entry)) {
    return entry.filter((a) => a.grade !== null && isFailingGrade(a.grade)).length;
  }
  return isFailingGrade(entry) ? 1 : 0;
}

export function hasExhaustedAttempts(entry: CourseGradeEntry): boolean {
  return !isCourseApproved(entry) && countFailedAttempts(entry) >= MAX_COURSE_ATTEMPTS;
}

export function hasGradeData(entry: CourseGradeEntry): boolean {
  if (entry === null || entry === undefined) return false;
  if (isCourseAttempts(entry)) return entry.some((a) => a.grade !== null);
  return true;
}

export function getApprovedCredits(entry: CourseGradeEntry, fallbackCredits: number): number {
  if (!isCourseApproved(entry)) return 0;
  if (isCourseAttempts(entry)) {
    const approved = entry.find(isApprovedAttempt);
    return approved ? approved.credits : fallbackCredits;
  }
  return fallbackCredits;
}

export function getEffectiveCredits(entry: CourseGradeEntry, fallbackCredits: number): number {
  if (isCourseAttempts(entry) && entry.length > 0) {
    const approved = entry.find(isApprovedAttempt);
    if (approved) return approved.credits;
    return Math.max(...entry.map((a) => a.credits));
  }
  return fallbackCredits;
}
