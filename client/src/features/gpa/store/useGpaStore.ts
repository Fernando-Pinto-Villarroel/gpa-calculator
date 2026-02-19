"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { buildDefaultGrades } from "../services/calculator";

interface GpaStore {
  grades: Record<string, LetterGrade | null>;
  selectedTermId: string;
  setGrade: (courseCode: string, grade: LetterGrade | null) => void;
  setSelectedTermId: (termId: string) => void;
  importGrades: (data: Record<string, LetterGrade | null>) => void;
  exportGrades: () => Record<string, LetterGrade | null>;
  resetToDefaults: () => void;
  clearAllGrades: () => void;
}

export const useGpaStore = create<GpaStore>()(
  persist(
    (set, get) => ({
      grades: buildDefaultGrades(),
      selectedTermId: "term-1",

      setGrade: (courseCode, grade) =>
        set((state) => ({
          grades: { ...state.grades, [courseCode]: grade },
        })),

      setSelectedTermId: (termId) => set({ selectedTermId: termId }),

      importGrades: (data) => set({ grades: data }),

      exportGrades: () => get().grades,

      resetToDefaults: () => set({ grades: buildDefaultGrades() }),

      clearAllGrades: () => {
        const empty: Record<string, null> = {};
        Object.keys(get().grades).forEach((code) => (empty[code] = null));
        set({ grades: empty });
      },
    }),
    {
      name: "jala-gpa-grades",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
