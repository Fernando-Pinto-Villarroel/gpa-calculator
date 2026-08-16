import { PlaygroundAssignment, PlaygroundAssignmentGroup, PlaygroundCourse } from "../types";

export type PlaygroundTranslator = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export const GROUP_ID_FORUMS = "group-forums";
export const GROUP_ID_ASSIGNMENTS = "group-assignments";
export const GROUP_ID_PROJECTS = "group-projects";
export const GROUP_ID_LABS = "group-labs";
export const GROUP_ID_PROFESSIONALISM = "group-professionalism";
export const GROUP_ID_UNGRADED = "group-ungraded";

const DEFAULT_WEEK_COUNT = 7;

export const KNOWN_DEFAULT_TITLES = [
  "Untitled Course",
  "Curso sin título",
  "Curso sem título",
];

export function buildDefaultGroups(t: PlaygroundTranslator): PlaygroundAssignmentGroup[] {
  return [
    { id: GROUP_ID_FORUMS, name: t("default_group_forums"), weightPercent: 2 },
    {
      id: GROUP_ID_ASSIGNMENTS,
      name: t("default_group_assignments"),
      weightPercent: 33,
    },
    { id: GROUP_ID_PROJECTS, name: t("default_group_projects"), weightPercent: 40 },
    { id: GROUP_ID_LABS, name: t("default_group_labs"), weightPercent: 20 },
    {
      id: GROUP_ID_PROFESSIONALISM,
      name: t("default_group_professionalism"),
      weightPercent: 5,
    },
    { id: GROUP_ID_UNGRADED, name: t("default_group_ungraded"), weightPercent: 0 },
  ];
}

export function buildDefaultAssignments(t: PlaygroundTranslator): PlaygroundAssignment[] {
  const weeklyAssignments: PlaygroundAssignment[] = [];

  for (let week = 1; week <= DEFAULT_WEEK_COUNT; week++) {
    weeklyAssignments.push({
      id: `lab-week-${week}`,
      groupId: GROUP_ID_LABS,
      name: t("default_assignment_lab", { week }),
      score: null,
      maxPoints: null,
    });

    if (week === 5) {
      weeklyAssignments.push({
        id: "quiz-1",
        groupId: GROUP_ID_ASSIGNMENTS,
        name: t("default_assignment_quiz_1"),
        score: null,
        maxPoints: null,
      });
    }

    if (week === 7) {
      weeklyAssignments.push({
        id: "quiz-2",
        groupId: GROUP_ID_ASSIGNMENTS,
        name: t("default_assignment_quiz_2"),
        score: null,
        maxPoints: null,
      });
    }

    weeklyAssignments.push(
      {
        id: `forum-week-${week}`,
        groupId: GROUP_ID_FORUMS,
        name: t("default_assignment_forum", { week }),
        score: null,
        maxPoints: null,
      },
      {
        id: `task-week-${week}`,
        groupId: GROUP_ID_ASSIGNMENTS,
        name: t("default_assignment_task", { week }),
        score: null,
        maxPoints: null,
      },
    );
  }

  return [
    ...weeklyAssignments,
    {
      id: "capstone",
      groupId: GROUP_ID_PROJECTS,
      name: t("default_assignment_capstone"),
      score: null,
      maxPoints: null,
    },
    {
      id: "professionalism",
      groupId: GROUP_ID_PROFESSIONALISM,
      name: t("default_assignment_professionalism"),
      score: 50,
      maxPoints: 50,
      tooltipKey: "professionalism",
    },
    {
      id: "survey",
      groupId: GROUP_ID_UNGRADED,
      name: t("default_assignment_survey"),
      score: null,
      maxPoints: null,
    },
  ];
}

export function buildDefaultPlayground(t: PlaygroundTranslator): PlaygroundCourse {
  return {
    title: t("default_title"),
    groups: buildDefaultGroups(t),
    assignments: buildDefaultAssignments(t),
  };
}
