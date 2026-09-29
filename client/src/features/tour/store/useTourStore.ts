import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_VERSION } from "@/core/config/app";

interface TourState {
  guidedTourCompleted: boolean;
  globalStepIndex: number;
  isActive: boolean;
  whatsNewSeenVersion: string | null;
  whatsNewOpen: boolean;
  openWhatsNew: () => void;
  markWhatsNewSeen: () => void;
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
      whatsNewSeenVersion: null,
      whatsNewOpen: false,
      openWhatsNew: () => set({ whatsNewOpen: true }),
      markWhatsNewSeen: () => set({ whatsNewSeenVersion: APP_VERSION, whatsNewOpen: false }),
      startTour: () => set({ isActive: true, globalStepIndex: 0 }),
      resumeTour: () => set({ isActive: true }),
      skipTour: () =>
        set({
          isActive: false,
          guidedTourCompleted: true,
          globalStepIndex: 0,
          whatsNewSeenVersion: APP_VERSION,
        }),
      completeTour: () =>
        set({
          isActive: false,
          guidedTourCompleted: true,
          globalStepIndex: 0,
          whatsNewSeenVersion: APP_VERSION,
        }),
      setGlobalStepIndex: (index) => set({ globalStepIndex: index }),
      resetTour: () =>
        set({ isActive: false, guidedTourCompleted: false, globalStepIndex: 0 }),
    }),
    {
      name: "jala-gpa-tour",
      partialize: (s) => ({
        guidedTourCompleted: s.guidedTourCompleted,
        globalStepIndex: s.globalStepIndex,
        whatsNewSeenVersion: s.whatsNewSeenVersion,
      }),
    },
  ),
);
