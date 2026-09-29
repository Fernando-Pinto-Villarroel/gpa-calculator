export interface Course {
  name: string;
  courseCode: string;
  type: string;
  credits: number;
  gpaWeight?: number;
  optional?: boolean;
  retakable?: boolean;
  placementTrack?: "level-1" | "level-2";
}

export interface Term {
  id: string;
  ordinal: string;
  modules: {
    [key: string]: Course[];
  };
}

export interface Cohort {
  id: string;
  ordinal: string;
  year: number;
  ongoing?: boolean;
  terms: Term[];
}

export function isRetakable(course: Course): boolean {
  return course.retakable !== false;
}
