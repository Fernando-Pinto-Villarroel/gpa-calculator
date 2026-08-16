export interface PlaygroundAssignmentGroup {
  id: string;
  name: string;
  weightPercent: number;
  nameCustomized?: boolean;
}

export type PlaygroundTooltipKey = "professionalism";

export interface PlaygroundAssignment {
  id: string;
  groupId: string;
  name: string;
  score: number | null;
  maxPoints: number | null;
  tooltipKey?: PlaygroundTooltipKey;
  nameCustomized?: boolean;
}

export interface PlaygroundCourse {
  title: string;
  groups: PlaygroundAssignmentGroup[];
  assignments: PlaygroundAssignment[];
}
