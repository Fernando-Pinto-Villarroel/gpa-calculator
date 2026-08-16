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
          name: "Operating Systems 1",
          courseCode: "IRE-116",
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
          courseCode: "FMA-112",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Database 1",
          courseCode: "BDA-117",
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
          courseCode: "ISO-115",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Calculus 1",
          courseCode: "FMA-113",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Communication 1",
          courseCode: "COM-118",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 1",
      courses: [
        {
          name: "Programming 2",
          courseCode: "APR-123",
          type: "Central Laboratory",
          credits: 3,
        },
        {
          name: "Linear Algebra",
          courseCode: "FMA-121",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Operating System 2",
          courseCode: "IRE-125",
          type: "Central Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 2",
      courses: [
        {
          name: "Database 2",
          courseCode: "BDA-126",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Software Development 2",
          courseCode: "ISO-124",
          type: "Central Laboratory",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-2",
      moduleName: "Module 3",
      courses: [
        {
          name: "History of Software Engineering",
          courseCode: "FHC-129",
          type: "General Education",
          credits: 1,
        },
        {
          name: "Communication 2",
          courseCode: "COM-127",
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
          courseCode: "APR-211",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Software Quality Engineering 1",
          courseCode: "ICA-216",
          type: "Central",
          credits: 3,
        },
        {
          name: "Calculus 2",
          courseCode: "FMA-212",
          type: "General Education",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-3",
      moduleName: "Module 2",
      courses: [
        {
          name: "Computer Networks 1",
          courseCode: "IRE-215",
          type: "Central",
          credits: 2,
        },
        {
          name: "Software Development 3",
          courseCode: "ISO-214",
          type: "Central Laboratory",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-3",
      moduleName: "Module 3",
      courses: [
        {
          name: "Software Quality Engineering 2",
          courseCode: "ICA-217",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Statistics",
          courseCode: "FMA-213",
          type: "General Education",
          credits: 3,
        },
        {
          name: "Writing & Composition 1",
          courseCode: "COM-219",
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
          name: "Computer Networks 2",
          courseCode: "CSNT-245",
          type: "Central Laboratory",
          credits: 2,
        },
        {
          name: "Software Development 4",
          courseCode: "CSSD-245",
          type: "Central Laboratory",
          credits: 3,
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
          name: "Introduction to Data Science and Machine Learning",
          courseCode: "CSDS-352",
          type: "Specialized Laboratory",
          credits: 2,
        },
        {
          name: "Software Development 5",
          courseCode: "CSSD-352",
          type: "Specialized Laboratory",
          credits: 3,
        },
      ],
    },
    {
      termId: "term-5",
      moduleName: "Module 3",
      courses: [
        {
          name: "Deep Learning / Generative AI",
          courseCode: "CSAI-353",
          type: "Specialized Laboratory",
          credits: 2,
        },
        {
          name: "Internet of Things",
          courseCode: "CSIO-353",
          type: "Specialized Laboratory",
          credits: 2,
        },
      ],
    },
    {
      termId: "term-6",
      moduleName: "Module 1",
      courses: [
        {
          name: "Programming 6",
          courseCode: "CSPR-364",
          type: "Specialized Laboratory",
          credits: 3,
        },
        {
          name: "Software Architecture 2",
          courseCode: "CSAR-364",
          type: "Specialized Laboratory",
          credits: 2,
        },
        {
          name: "User Interface & User Experience Design",
          courseCode: "CSUX-364",
          type: "Specialized Laboratory",
          credits: 2,
        },
      ],
    },
  ]),
};
