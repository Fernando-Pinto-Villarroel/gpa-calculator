import { Module } from "./module.js";

export interface Semester {
  [semesterName: string]: Module;
}
