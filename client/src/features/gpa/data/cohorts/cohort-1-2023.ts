import type { Cohort } from "@/core/domain/types/course";

export const cohort1_2023: Cohort = {
  id: "cohort-1-2023",
  label: "Cohort I - 2023",
  terms: [
    {
      id: "term-1",
      label: "Term I",
      modules: {
        "Module 1": [
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
        "Module 2": [
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
          {
            name: "English 1",
            courseCode: "COM-119",
            type: "General Education",
            credits: 4,
          },
        ],
        "Module 3": [
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
    },
    {
      id: "term-2",
      label: "Term II",
      modules: {
        "Module 1": [
          {
            name: "Linear Algebra",
            courseCode: "MATH-124",
            type: "General Education",
            credits: 3,
          },
          {
            name: "Programming 2",
            courseCode: "CSPR-124",
            type: "Central Laboratory",
            credits: 3,
          },
          {
            name: "Operating System 2",
            courseCode: "CSOS-124",
            type: "Central Laboratory",
            credits: 2,
          },
        ],
        "Module 2": [
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
        "Module 3": [
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
    },
    {
      id: "term-3",
      label: "Term III",
      modules: {
        "Module 1": [
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
        "Module 2": [
          {
            name: "Software Development 3",
            courseCode: "CSSD-232",
            type: "Central Laboratory",
            credits: 3,
          },
          {
            name: "Computer Networks 1",
            courseCode: "CSNT-232",
            type: "Central",
            credits: 2,
          },
        ],
        "Module 3": [
          {
            name: "Software Quality Engineering 2",
            courseCode: "CSSQ-233",
            type: "Central Laboratory",
            credits: 2,
          },
          {
            name: "Statistics",
            courseCode: "MATH-233",
            type: "General Education",
            credits: 3,
          },
          {
            name: "Writing & Composition 1",
            courseCode: "WRIT-219",
            type: "General Education",
            credits: 3,
          },
        ],
      },
    },
    {
      id: "term-4",
      label: "Term IV",
      modules: {
        "Module 1": [
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
        "Module 2": [
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
        "Module 3": [
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
    },
    {
      id: "term-5",
      label: "Term V",
      modules: {
        "Module 1": [
          {
            name: "Programming 5",
            courseCode: "CSPR-351",
            type: "Specialized Laboratory",
            credits: 3,
          },
          {
            name: "Software Architecture 1",
            courseCode: "CSAR-351",
            type: "Specialized Laboratory",
            credits: 2,
          },
          {
            name: "Algorithmics 2",
            courseCode: "CSAL-351",
            type: "Central Laboratory",
            credits: 2,
          },
        ],
        "Module 2": [
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
        "Module 3": [
          {
            name: "Internet of Things",
            courseCode: "CSIO-353",
            type: "Specialized Laboratory",
            credits: 2,
          },
          {
            name: "Deep Learning / Generative AI",
            courseCode: "CSAI-353",
            type: "Specialized Laboratory",
            credits: 2,
          },
        ],
      },
    },
    {
      id: "term-6",
      label: "Term VI",
      modules: {
        "Module 1": [
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
        "Module 2": [
          {
            name: "Software Development 6",
            courseCode: "CSSD-365",
            type: "Specialized Laboratory",
            credits: 3,
          },
          {
            name: "Web Development",
            courseCode: "CSWB-366",
            type: "Specialization",
            credits: 2,
          },
        ],
        "Module 3": [
          {
            name: "Programming Languages",
            courseCode: "CSPR-366",
            type: "Specialization",
            credits: 2,
          },
          {
            name: "Systems Administration",
            courseCode: "CSSA-366",
            type: "Central Laboratory",
            credits: 2,
          },
        ],
      },
    },
    {
      id: "term-7",
      label: "Term VII",
      modules: {
        "Module 1": [
          {
            name: "Programming 7",
            courseCode: "CSPR-471",
            type: "Specialized Laboratory",
            credits: 3,
          },
          {
            name: "Software Architecture 3",
            courseCode: "CSAR-484",
            type: "Specialized Laboratory",
            credits: 2,
          },
        ],
        "Module 2": [
          {
            name: "Software Architecture 4",
            courseCode: "CSAR-486",
            type: "Specialized Laboratory",
            credits: 2,
          },
        ],
        "Module 3": [
          {
            name: "Mobile Application Development",
            courseCode: "CSWB-473",
            type: "Specialization",
            credits: 2,
          },
          {
            name: "Software Projects & Startups",
            courseCode: "CSRP-486",
            type: "Specialized Laboratory",
            credits: 2,
          },
        ],
      },
    },
    {
      id: "term-8",
      label: "Term VIII",
      modules: {
        "Module 1": [
          {
            name: "Research Project on Software Development 1",
            courseCode: "CSRP-471",
            type: "Internship",
            credits: 4,
          },
        ],
        "Module 2": [
          {
            name: "Research Project on Software Development 2",
            courseCode: "CSRP-472",
            type: "Internship",
            credits: 4,
          },
        ],
        "Module 3": [
          {
            name: "Research Project on Software Development 3",
            courseCode: "CSRP-484",
            type: "Internship",
            credits: 4,
          },
        ],
      },
    },
  ],
};
