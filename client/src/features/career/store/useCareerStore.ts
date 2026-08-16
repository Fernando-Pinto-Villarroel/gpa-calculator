"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CareerId } from "@/core/domain/types/career";
import { getCareerPalette } from "../theme";

interface CareerStore {
  selectedCareerId: CareerId;
  setSelectedCareerId: (careerId: CareerId) => void;
}

export const useCareerStore = create<CareerStore>()(
  persist(
    (set) => ({
      selectedCareerId: "software_engineering_design_architecture",
      setSelectedCareerId: (careerId) => {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-career", careerId);
          document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", getCareerPalette(careerId).accent700);
        }
        set({ selectedCareerId: careerId });
      },
    }),
    {
      name: "jala-career-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
