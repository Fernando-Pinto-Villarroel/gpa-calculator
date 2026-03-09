"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { CourseGradeEntry } from "@/core/domain/types/grades";
import { buildDefaultGradesForTerms } from "../services/calculator";
import { DEFAULT_COHORT_ID, getCohortById } from "../data/index";

interface GpaStore {
  gradesByCohort: Record<string, Record<string, CourseGradeEntry>>;
  grades: Record<string, CourseGradeEntry>;
  selectedCohortId: string;
  selectedTermId: string;
  setGrade: (courseCode: string, grade: LetterGrade | null) => void;
  setGradeEntry: (courseCode: string, entry: CourseGradeEntry) => void;
  setSelectedCohortId: (cohortId: string) => void;
  setSelectedTermId: (termId: string) => void;
  importGrades: (data: {
    cohortId: string;
    grades: Record<string, CourseGradeEntry>;
  }) => void;
  exportGrades: () => {
    version: number;
    cohortId: string;
    grades: Record<string, CourseGradeEntry>;
  };
  resetToDefaults: () => void;
  clearAllGrades: () => void;
  resetTermData: () => void;
  resetCohortData: () => void;
}

function defaultGradesForCohort(
  cohortId: string,
): Record<string, CourseGradeEntry> {
  const cohort = getCohortById(cohortId);
  return buildDefaultGradesForTerms(cohort?.terms ?? []);
}

export const useGpaStore = create<GpaStore>()(
  persist(
    (set, get) => ({
      gradesByCohort: {
        [DEFAULT_COHORT_ID]: defaultGradesForCohort(DEFAULT_COHORT_ID),
      },
      grades: defaultGradesForCohort(DEFAULT_COHORT_ID),
      selectedCohortId: DEFAULT_COHORT_ID,
      selectedTermId: "term-1",

      setGrade: (courseCode, grade) =>
        set((state) => {
          const updated = { ...state.grades, [courseCode]: grade };
          return {
            grades: updated,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: updated,
            },
          };
        }),

      setGradeEntry: (courseCode, entry) =>
        set((state) => {
          const updated = { ...state.grades, [courseCode]: entry };
          return {
            grades: updated,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: updated,
            },
          };
        }),

      setSelectedCohortId: (cohortId) =>
        set((state) => {
          const cohortGrades =
            state.gradesByCohort[cohortId] ?? defaultGradesForCohort(cohortId);
          return {
            selectedCohortId: cohortId,
            selectedTermId: "term-1",
            grades: cohortGrades,
            gradesByCohort: {
              ...state.gradesByCohort,
              [cohortId]: cohortGrades,
            },
          };
        }),

      setSelectedTermId: (termId) => set({ selectedTermId: termId }),

      importGrades: (data) =>
        set((state) => {
          const { cohortId, grades } = data;
          return {
            grades,
            selectedCohortId: cohortId,
            selectedTermId: "term-1",
            gradesByCohort: {
              ...state.gradesByCohort,
              [cohortId]: grades,
            },
          };
        }),

      exportGrades: () => ({
        version: 2,
        cohortId: get().selectedCohortId,
        grades: get().grades,
      }),

      resetToDefaults: () =>
        set((state) => {
          const defaults = defaultGradesForCohort(state.selectedCohortId);
          return {
            grades: defaults,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: defaults,
            },
          };
        }),

      clearAllGrades: () =>
        set((state) => {
          const empty: Record<string, null> = {};
          Object.keys(state.grades).forEach((code) => (empty[code] = null));
          return {
            grades: empty,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: empty,
            },
          };
        }),

      resetTermData: () =>
        set((state) => {
          const cohort = getCohortById(state.selectedCohortId);
          const selectedTerm = cohort?.terms.find(
            (term) => term.id === state.selectedTermId,
          );

          if (!selectedTerm) return state;

          const updatedGrades = { ...state.grades };
          Object.values(selectedTerm.modules).forEach((courses) => {
            courses.forEach((course) => {
              updatedGrades[course.courseCode] = null;
            });
          });

          return {
            grades: updatedGrades,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: updatedGrades,
            },
          };
        }),

      resetCohortData: () =>
        set((state) => {
          const defaults = defaultGradesForCohort(state.selectedCohortId);
          return {
            grades: defaults,
            gradesByCohort: {
              ...state.gradesByCohort,
              [state.selectedCohortId]: defaults,
            },
          };
        }),
    }),
    {
      name: "jala-gpa-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gradesByCohort: state.gradesByCohort,
        selectedCohortId: state.selectedCohortId,
        selectedTermId: state.selectedTermId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cohortId = state.selectedCohortId ?? DEFAULT_COHORT_ID;
          state.grades =
            state.gradesByCohort?.[cohortId] ??
            defaultGradesForCohort(cohortId);
        }
      },
    },
  ),
);
