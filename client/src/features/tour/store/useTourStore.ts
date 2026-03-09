import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TourState {
  guidedTourCompleted: boolean;
  globalStepIndex: number;
  isActive: boolean;
  startTour: () => void;
  resumeTour: () => void;
  skipTour: () => void;
  completeTour: () => void;
  setGlobalStepIndex: (index: number) => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set) => ({
      guidedTourCompleted: false,
      globalStepIndex: 0,
      isActive: false,
      startTour: () => set({ isActive: true, globalStepIndex: 0 }),
      resumeTour: () => set({ isActive: true }),
      skipTour: () => set({ isActive: false, guidedTourCompleted: true, globalStepIndex: 0 }),
      completeTour: () => set({ isActive: false, guidedTourCompleted: true, globalStepIndex: 0 }),
      setGlobalStepIndex: (index) => set({ globalStepIndex: index }),
      resetTour: () =>
        set({ isActive: false, guidedTourCompleted: false, globalStepIndex: 0 }),
    }),
    {
      name: "jala-gpa-tour",
      partialize: (s) => ({
        guidedTourCompleted: s.guidedTourCompleted,
        globalStepIndex: s.globalStepIndex,
      }),
    },
  ),
);
