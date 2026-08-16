export interface Course {
  name: string;
  courseCode: string;
  type: string;
  credits: number;
  gpaWeight?: number;
  optional?: boolean;
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
