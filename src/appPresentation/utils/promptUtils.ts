import { calculateMaxCoursesWithGrade } from "../../core/application/services/calculator.js";
import { LetterGrade } from "../../core/domain/types/letterGrades.js";
import { displayUtils } from "./displayUtils.js";
import readline from "readline";

export const promptUtils = {
  promptForTargetGPA(rl: readline.Interface, remainingCourses: any[]): void {
    rl.question(
      "\nWhat is your target GPA? (default 3.90): ",
      (targetGPAInput) => {
        const targetGPA = targetGPAInput ? parseFloat(targetGPAInput) : 3.9;
        this.promptForDefaultGrade(rl, targetGPA, remainingCourses);
      }
    );
  },

  promptForDefaultGrade(
    rl: readline.Interface,
    targetGPA: number,
    remainingCourses: any[]
  ): void {
    rl.question(
      "What grade do you generally plan to achieve in your remaining courses? (default A): ",
      (defaultGradeInput) => {
        const defaultGrade = (defaultGradeInput || "A") as LetterGrade;
        this.promptForAlternateGrade(
          rl,
          targetGPA,
          defaultGrade,
          remainingCourses
        );
      }
    );
  },

  promptForAlternateGrade(
    rl: readline.Interface,
    targetGPA: number,
    defaultGrade: LetterGrade,
    remainingCourses: any[]
  ): void {
    rl.question(
      "What alternate grade are you considering? (default A-): ",
      (alternateGradeInput) => {
        const alternateGrade = (alternateGradeInput || "A-") as LetterGrade;
        this.displayResults(
          rl,
          targetGPA,
          defaultGrade,
          alternateGrade,
          remainingCourses
        );
      }
    );
  },

  displayResults(
    rl: readline.Interface,
    targetGPA: number,
    defaultGrade: LetterGrade,
    alternateGrade: LetterGrade,
    remainingCourses: any[]
  ): void {
    const maxCoursesWithAlternateGrade = calculateMaxCoursesWithGrade(
      targetGPA,
      defaultGrade,
      alternateGrade
    );

    displayUtils.displayResults(
      targetGPA,
      defaultGrade,
      alternateGrade,
      maxCoursesWithAlternateGrade,
      remainingCourses.length
    );

    rl.close();
  },
};
