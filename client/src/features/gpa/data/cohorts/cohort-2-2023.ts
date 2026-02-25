import type { Cohort } from "@/core/domain/types/course";
import { patchTerms } from "./_shared";

export const cohort2_2023: Cohort = {
  id: "cohort-2-2023",
  ordinal: "II",
  year: 2023,
  terms: patchTerms([
    {
      termId: "term-1",
      moduleName: "Module 1",
      courses: [
        {
          name: "Logic",
          courseCode: "MATH-111",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Programming 1",
          courseCode: "CSPR-111",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Operating Systems 1",
          courseCode: "CSOS-112",
          type: "Central Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-1",
      moduleName: "Module 2",
      courses: [
        {
          name: "Discrete Mathematics",
          courseCode: "MATH-112",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Database 1",
          courseCode: "CSDB-112",
          type: "Central Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-1",
      moduleName: "Module 3",
      courses: [
        {
          name: "Software Development 1",
          courseCode: "CSSD-113",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Calculus 1",
          courseCode: "MATH-113",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Communication 1",
          courseCode: "COMM-118",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 2",
      courses: [
        {
          name: "Software Development 2",
          courseCode: "CSSD-125",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Database 2",
          courseCode: "CSDB-125",
          type: "Central Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 3",
      courses: [
        {
          name: "History of Software Engineering",
          courseCode: "HIST-111",
          type: "General Education",
          credits: 1,
        },
        {
          name: "Communication 2",
          courseCode: "COMM-127",
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
          name: "Software Quality Engineering 1",
          courseCode: "CSSQ-231",
          type: "Central",
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
      termId: "term-4",
      moduleName: "Module 1",
      courses: [
        {
          name: "Programming 4",
          courseCode: "CSPR-244",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Software Quality Engineering 3",
          courseCode: "CSSQ-246",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Algorithmics 1",
          courseCode: "CSAL-244",
          type: "Central",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-4",
      moduleName: "Module 2",
      courses: [
        {
          name: "Software Development 4",
          courseCode: "CSSD-245",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Computer Networks 2",
          courseCode: "CSNT-245",
          type: "Central Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-4",
      moduleName: "Module 3",
      courses: [
        {
          name: "Development & Operations",
          courseCode: "CSDV-246",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Writing & Composition 2",
          courseCode: "WRIT-229",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-5",
      moduleName: "Module 2",
      courses: [
        {
          name: "Software Development 5",
          courseCode: "CSSD-352",
          type: "Specialized Laboratory",
          credits: 3,
        },
        {
          name: "Introduction to Data Science and Machine Learning",
          courseCode: "CSDS-352",
          type: "Specialized Laboratory",
          credits: 2,
        },
      ],
    },
  ]),
};
