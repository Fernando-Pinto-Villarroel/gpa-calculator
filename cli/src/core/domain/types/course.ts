import { CourseType } from "./courseTypes.js";
import { LetterGrade } from "./letterGrades.js";

export interface Course {
  name: string;
  courseCode: string;
  type: CourseType;
  credits: number;
  grade?: LetterGrade;
}
