import type { Cohort } from "@/core/domain/types/course";
import { patchTerms } from "./_shared";

export const cohort2_2024: Cohort = {
  id: "cohort-2-2024",
  ordinal: "II",
  year: 2024,
  terms: patchTerms([
    {
      termId: "term-3",
      moduleName: "Module 1",
      courses: [
        { name: "Programming 3", courseCode: "CSPR-231", type: "Central Laboratory", credits: 2 },
        { name: "Communication 2", courseCode: "COMM-127", type: "General Education", credits: 3 },
        { name: "Software Quality Engineering 1", courseCode: "CSSQ-231", type: "Central", credits: 3 },
      ],
    },
  ]),
};
