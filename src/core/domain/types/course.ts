import { LetterGrade } from "./letterGrades.js";

export interface Course {
  nombre: string;
  creditos: number;
  grade?: LetterGrade;
}
