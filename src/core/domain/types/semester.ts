import { Course } from "./course.js";

export interface Semester {
  [semesterName: string]: Course[];
}
