import type { Term } from "@/core/domain/types/course";

export function baseTerms(): Term[] {
  return [
    {
      id: "level-1",
      ordinal: "1",
      modules: {
        "Level 1": [
          {
            name: "ESP 1 - Beginning English for Software Engineers I",
            courseCode: "ESP-101",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M3L1",
            courseCode: "ESP-101-M3L1",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M4L1",
            courseCode: "ESP-101-M4L1",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "ESP 2 - Beginning English for Software Engineers II",
            courseCode: "ESP-201",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
        ],
      },
    },
    {
      id: "level-2",
      ordinal: "2",
      modules: {
        "Level 2": [
          {
            name: "Lab M2L2",
            courseCode: "ESP-201-M2L2",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M3L2",
            courseCode: "ESP-201-M3L2",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M4L2",
            courseCode: "ESP-201-M4L2",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M5L2",
            courseCode: "ESP-201-M5L2",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M6",
            courseCode: "ESP-201-M6",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M7",
            courseCode: "ESP-201-M7",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "ESP 3 - Business English",
            courseCode: "ESP-301",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M9",
            courseCode: "ESP-201-M9",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Lab M10",
            courseCode: "ESP-201-M10",
            type: "Core Lab",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "ESP 4 - English for Software Engineering I",
            courseCode: "ESP-401",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "Special Lab M12",
            courseCode: "ESP-301-M12",
            type: "Lab",
            credits: 0,
            gpaWeight: 1,
            optional: true,
          },
        ],
      },
    },
    {
      id: "level-3",
      ordinal: "3",
      modules: {
        "Level 3": [
          {
            name: "Special Lab M13",
            courseCode: "ESP-301-M13",
            type: "Lab",
            credits: 0,
            gpaWeight: 1,
            optional: true,
          },
          {
            name: "Special Lab M14",
            courseCode: "ESP-301-M14",
            type: "Lab",
            credits: 0,
            gpaWeight: 1,
            optional: true,
          },
          {
            name: "Special Lab M15",
            courseCode: "ESP-301-M15",
            type: "Lab",
            credits: 0,
            gpaWeight: 1,
            optional: true,
          },
          {
            name: "Special Lab M16",
            courseCode: "ESP-301-M16",
            type: "Lab",
            credits: 0,
            gpaWeight: 1,
            optional: true,
          },
          {
            name: "ESP 5 - Interview Preparation & Written Communication I",
            courseCode: "ESP-501",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
          {
            name: "ESP 6 - English for Software Engineering II",
            courseCode: "ESP-601",
            type: "Core",
            credits: 0,
            gpaWeight: 1,
          },
        ],
      },
    },
  ];
}
