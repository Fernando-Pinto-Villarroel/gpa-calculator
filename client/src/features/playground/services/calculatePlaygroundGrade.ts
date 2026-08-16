import { PlaygroundAssignment, PlaygroundAssignmentGroup } from "../types";

export interface GroupGradeResult {
  groupId: string;
  earnedPoints: number;
  possiblePoints: number;
  percent: number | null;
  gradedCount: number;
}

export interface PlaygroundGradeResult {
  totalPercent: number | null;
  groupResults: GroupGradeResult[];
}

function isGraded(assignment: PlaygroundAssignment): boolean {
  return (
    assignment.score !== null &&
    assignment.maxPoints !== null &&
    assignment.maxPoints > 0
  );
}

export function calculateGroupGrade(
  group: PlaygroundAssignmentGroup,
  assignments: PlaygroundAssignment[],
): GroupGradeResult {
  const graded = assignments.filter((a) => a.groupId === group.id && isGraded(a));

  const earnedPoints = graded.reduce((sum, a) => sum + (a.score ?? 0), 0);
  const possiblePoints = graded.reduce((sum, a) => sum + (a.maxPoints ?? 0), 0);
  const percent = possiblePoints > 0 ? (earnedPoints / possiblePoints) * 100 : null;

  return {
    groupId: group.id,
    earnedPoints,
    possiblePoints,
    percent,
    gradedCount: graded.length,
  };
}

export function calculatePlaygroundTotal(
  groups: PlaygroundAssignmentGroup[],
  assignments: PlaygroundAssignment[],
): PlaygroundGradeResult {
  const groupResults = groups.map((group) => calculateGroupGrade(group, assignments));

  const gradedResults = groupResults.filter((r) => r.percent !== null);
  const includedWeight = gradedResults.reduce(
    (sum, r) => sum + (groups.find((g) => g.id === r.groupId)?.weightPercent ?? 0),
    0,
  );

  if (gradedResults.length === 0 || includedWeight === 0) {
    return { totalPercent: null, groupResults };
  }

  const weightedSum = gradedResults.reduce((sum, r) => {
    const weight = groups.find((g) => g.id === r.groupId)?.weightPercent ?? 0;
    return sum + (r.percent as number) * weight;
  }, 0);

  return { totalPercent: weightedSum / includedWeight, groupResults };
}

export function sumGroupWeights(groups: PlaygroundAssignmentGroup[]): number {
  return groups.reduce((sum, g) => sum + g.weightPercent, 0);
}
