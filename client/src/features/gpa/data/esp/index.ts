import type { Cohort, Term } from "@/core/domain/types/course";
import { cohort1_2023 } from "./cohorts/cohort-1-2023";
import { cohort2_2023 } from "./cohorts/cohort-2-2023";
import { cohort1_2024 } from "./cohorts/cohort-1-2024";
import { cohort2_2024 } from "./cohorts/cohort-2-2024";
import { cohort1_2025 } from "./cohorts/cohort-1-2025";
import { cohort2_2025 } from "./cohorts/cohort-2-2025";
import { cohort1_2026 } from "./cohorts/cohort-1-2026";
import { cohort2_2026 } from "./cohorts/cohort-2-2026";

export const DEFAULT_ESP_COHORT_ID = "cohort-2-2026";

export const espCohorts: Cohort[] = [
  cohort1_2023,
  cohort2_2023,
  cohort1_2024,
  cohort2_2024,
  cohort1_2025,
  cohort2_2025,
  cohort1_2026,
  cohort2_2026,
];

export function getEspCohortById(id: string): Cohort | undefined {
  return espCohorts.find((c) => c.id === id);
}

export function getEspTermsByCohortId(id: string): Term[] {
  return getEspCohortById(id)?.terms ?? [];
}
