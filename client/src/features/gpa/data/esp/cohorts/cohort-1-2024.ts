import type { Cohort } from "@/core/domain/types/course";
import { baseTerms } from "./_shared";

export const cohort1_2024: Cohort = {
  id: "cohort-1-2024",
  ordinal: "I",
  year: 2024,
  terms: baseTerms(),
};
