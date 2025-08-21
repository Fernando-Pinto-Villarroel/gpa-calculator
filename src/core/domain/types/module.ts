import { Course } from "./course.js";

export interface Module {
  [moduleName: string]: Course[];
}
