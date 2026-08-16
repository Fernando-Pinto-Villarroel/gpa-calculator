import type { Cohort } from "@/core/domain/types/course";
import { baseTerms } from "./_shared";

export const cohort1_2023: Cohort = {
  id: "cohort-1-2023",
  ordinal: "I",
  year: 2023,
  terms: baseTerms(),
};
