import { LetterGrade } from "./letterGrades";

export interface Course {
  name: string;
  courseCode: string;
  type: string;
  credits: number;
  defaultGrade?: LetterGrade;
}

export interface Term {
  id: string;
  label: string;
  year: string;
  yearName: string;
  semesterName: string;
  modules: {
    "Module 1": Course[];
    "Module 2": Course[];
    "Module 3": Course[];
  };
}
