import { LetterGrade } from "./letterGrades";

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

export function getEffectiveGrade(entry: CourseGradeEntry): LetterGrade | null {
  if (entry === null || entry === undefined) return null;
  if (isCourseAttempts(entry)) {
    if (entry.length === 0) return null;
    const approvedAttempt = entry.find((a) => a.approved && a.grade !== null);
    if (approvedAttempt) return approvedAttempt.grade;
    const lastWithGrade = [...entry].reverse().find((a) => a.grade !== null);
    return lastWithGrade?.grade ?? null;
  }
  return entry;
}

export function isCourseApproved(entry: CourseGradeEntry): boolean {
  if (entry === null || entry === undefined) return false;
  if (isCourseAttempts(entry)) return entry.some((a) => a.approved && a.grade !== null);
  return true;
}

export function hasGradeData(entry: CourseGradeEntry): boolean {
  if (entry === null || entry === undefined) return false;
  if (isCourseAttempts(entry)) return entry.some((a) => a.grade !== null);
  return true;
}

export function getApprovedCredits(entry: CourseGradeEntry, fallbackCredits: number): number {
  if (!isCourseApproved(entry)) return 0;
  if (isCourseAttempts(entry)) {
    const approved = entry.find((a) => a.approved && a.grade !== null);
    return approved ? approved.credits : fallbackCredits;
  }
  return fallbackCredits;
}

export function getEffectiveCredits(entry: CourseGradeEntry, fallbackCredits: number): number {
  if (isCourseAttempts(entry) && entry.length > 0) {
    const approved = entry.find((a) => a.approved && a.grade !== null);
    if (approved) return approved.credits;
    return Math.max(...entry.map((a) => a.credits));
  }
  return fallbackCredits;
}
