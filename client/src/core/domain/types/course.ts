export interface Course {
  name: string;
  courseCode: string;
  type: string;
  credits: number;
}

export interface Term {
  id: string;
  label: string;
  modules: {
    "Module 1": Course[];
    "Module 2": Course[];
    "Module 3": Course[];
  };
}

export interface Cohort {
  id: string;
  label: string;
  terms: Term[];
}
