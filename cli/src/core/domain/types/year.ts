import { Semester } from "./semester.js";

export interface Year {
  [yearName: string]: Semester;
}
