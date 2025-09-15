import { LetterGrade } from "./letterGrades.js";

export interface Course {
  name: string;
  credits: number;
  grade?: LetterGrade;
  courseCode?: string;
}
