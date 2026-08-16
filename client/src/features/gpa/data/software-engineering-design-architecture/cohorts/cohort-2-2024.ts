import type { Cohort } from "@/core/domain/types/course";
import { patchTerms } from "./_shared";

export const cohort2_2024: Cohort = {
  id: "cohort-2-2024",
  ordinal: "II",
  year: 2024,
  terms: patchTerms([
    {
      termId: "term-1",
      moduleName: "Module 1",
      courses: [
        {
          name: "Programming 1",
          courseCode: "APR-114",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Logic",
          courseCode: "FMA-111",
          type: "General Education",
          credits: 3,
        },
        {
          name: "History of Software Engineering",
          courseCode: "FHC-129",
          type: "General Education",
          credits: 1,
        },
      ],
    },
    {
      termId: "term-1",
      moduleName: "Module 2",
      courses: [
        {
          name: "Operating Systems 1",
          courseCode: "IRE-116",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Discrete Mathematics",
          courseCode: "FMA-112",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-1",
      moduleName: "Module 3",
      courses: [
        {
          name: "Software Development 1",
          courseCode: "ISO-115",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Database 1",
          courseCode: "BDA-117",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Calculus 1",
          courseCode: "FMA-113",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 3",
      courses: [
        {
          name: "Communication 1",
          courseCode: "COM-118",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Calculus 2",
          courseCode: "MATH-126",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-3",
      moduleName: "Module 1",
      courses: [
        {
          name: "Programming 3",
          courseCode: "CSPR-231",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Communication 2",
          courseCode: "COM-127",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Software Quality Engineering 1",
          courseCode: "CSSQ-231",
          type: "Central",
          credits: 3,
        },
      ],
    },
  ]),
};
