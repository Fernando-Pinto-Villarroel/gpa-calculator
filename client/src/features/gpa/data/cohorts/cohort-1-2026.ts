import type { Cohort } from "@/core/domain/types/course";
import { baseTerms } from "./_shared";

export const cohort1_2026: Cohort = {
  id: "cohort-1-2026",
  ordinal: "I",
  year: 2026,
  ongoing: true,
  terms: baseTerms(),
};
