"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CourseGradeEntry } from "@/core/domain/types/grades";
import { buildDefaultGradesForTerms } from "../services/calculator";
import { DEFAULT_ESP_COHORT_ID, getEspCohortById } from "../data/esp/index";

interface EspGpaStore {
  gradesByCohort: Record<string, Record<string, CourseGradeEntry>>;
  grades: Record<string, CourseGradeEntry>;
  selectedCohortId: string;
  setGradeEntry: (courseCode: string, entry: CourseGradeEntry) => void;
  setSelectedCohortId: (cohortId: string) => void;
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
  resetCohortData: () => void;
}

function defaultGradesForCohort(
  cohortId: string,
): Record<string, CourseGradeEntry> {
  const cohort = getEspCohortById(cohortId);
  return buildDefaultGradesForTerms(cohort?.terms ?? []);
}

export const useEspGpaStore = create<EspGpaStore>()(
  persist(
    (set, get) => ({
      gradesByCohort: {
        [DEFAULT_ESP_COHORT_ID]: defaultGradesForCohort(DEFAULT_ESP_COHORT_ID),
      },
      grades: defaultGradesForCohort(DEFAULT_ESP_COHORT_ID),
      selectedCohortId: DEFAULT_ESP_COHORT_ID,

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
            grades: cohortGrades,
            gradesByCohort: {
              ...state.gradesByCohort,
              [cohortId]: cohortGrades,
            },
          };
        }),

      importGrades: (data) =>
        set((state) => {
          const { cohortId, grades } = data;
          return {
            grades,
            selectedCohortId: cohortId,
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
      name: "jala-esp-gpa-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gradesByCohort: state.gradesByCohort,
        selectedCohortId: state.selectedCohortId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cohortId = state.selectedCohortId ?? DEFAULT_ESP_COHORT_ID;
          state.grades =
            state.gradesByCohort?.[cohortId] ??
            defaultGradesForCohort(cohortId);
        }
      },
    },
  ),
);
