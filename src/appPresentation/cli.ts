import {
  calculateBasicStats,
  calculateCurrentGPA,
  calculateModuleStats,
  getRemainingCourses,
} from "../core/application/services/calculator.js";

import { displayUtils } from "./utils/displayUtils.js";
import { promptUtils } from "./utils/promptUtils.js";
import readline from "readline";

export function startCLI(): void {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const stats = calculateBasicStats();
  displayUtils.displayBasicStats(stats);

  const { gpa, completedCredits, totalCompletedCourses } =
    calculateCurrentGPA();
  displayUtils.displayCurrentGPA(gpa, completedCredits, totalCompletedCourses);

  // const moduleStats = calculateModuleStats();
  // displayUtils.displayModuleStats(moduleStats);

  const { courses: remainingCourses, totalCredits: remainingCredits } =
    getRemainingCourses();
  // displayUtils.displayRemainingCourses(
  //   remainingCourses.length,
  //   remainingCredits
  // );

  promptUtils.promptForTargetGPA(rl, remainingCourses);
}
