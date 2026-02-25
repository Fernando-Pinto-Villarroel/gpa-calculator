import type { Cohort } from "@/core/domain/types/course";
import { patchTerms } from "./_shared";

export const cohort2_2023: Cohort = {
  id: "cohort-2-2023",
  ordinal: "II",
  year: 2023,
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
    {
      termId: "term-5",
      moduleName: "Module 2",
      courses: [
        { name: "Software Development 5", courseCode: "CSSD-352", type: "Specialized Laboratory", credits: 3 },
        { name: "Introduction to Data Science and Machine Learning", courseCode: "CSDS-352", type: "Specialized Laboratory", credits: 2 },
      ],
    },
  ]),
};
