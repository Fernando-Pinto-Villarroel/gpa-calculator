import {
  letterGradesMap,
  LetterGrade,
} from "../../core/domain/types/letterGrades.js";

export const displayUtils = {
  displayBasicStats(stats: {
    numYears: number;
    numSemesters: number;
    totalCourses: number;
    totalCredits: number;
    numModulesPerSemester: Record<string, number>;
  }): void {
    console.log("\n===== CURRICULUM STATISTICS =====");
    console.log(`Number of years: ${stats.numYears}`);
    console.log(`Number of semesters: ${stats.numSemesters}`);
    console.log(`Total number of courses: ${stats.totalCourses}`);
    console.log(`Total number of credits: ${stats.totalCredits}`);
  },

  displayCurrentGPA(
    gpa: number,
    completedCredits: number,
    totalCompletedCourses: number
  ): void {
    console.log("\n===== CURRENT GPA =====");
    console.log(`Current GPA: ${gpa.toFixed(3)}`);
    console.log(`Completed credits: ${completedCredits}`);
    console.log(`Completed courses: ${totalCompletedCourses}`);
  },

  displayModuleStats(moduleStats: Record<string, any>): void {
    console.log("\n===== MODULE STATISTICS =====");
    Object.entries(moduleStats).forEach(([moduleName, stats]) => {
      console.log(`\n--- ${moduleName} ---`);
      console.log(
        `Completed courses: ${stats.completedCourses}/${stats.totalCourses}`
      );
      console.log(
        `Completed credits: ${stats.completedCredits}/${stats.totalCredits}`
      );
      console.log(`Remaining courses: ${stats.remainingCourses}`);
      console.log(`Remaining credits: ${stats.remainingCredits}`);
      if (stats.completedCourses > 0) {
        console.log(`Module GPA: ${stats.moduleGPA.toFixed(3)}`);
      }
    });
  },

  displayRemainingCourses(
    remainingCoursesCount: number,
    remainingCredits: number
  ): void {
    console.log("\n===== REMAINING COURSES =====");
    console.log(`Remaining courses: ${remainingCoursesCount}`);
    console.log(`Remaining credits: ${remainingCredits}`);
  },

  displayResults(
    targetGPA: number,
    defaultGrade: LetterGrade,
    alternateGrade: LetterGrade,
    maxCoursesWithAlternateGrade: number,
    totalRemainingCourses: number
  ): void {
    console.log("\n===== RESULTS =====");
    console.log(`To maintain a GPA of at least ${targetGPA.toFixed(2)}:`);
    console.log(
      `- Planned grade for most courses: ${defaultGrade} (${letterGradesMap[defaultGrade]} points)`
    );
    console.log(
      `- Alternate grade: ${alternateGrade} (${letterGradesMap[alternateGrade]} points)`
    );
    console.log(
      `- Maximum number of courses with grade ${alternateGrade}: ${maxCoursesWithAlternateGrade} out of ${totalRemainingCourses} remaining courses`
    );

    if (maxCoursesWithAlternateGrade === 0) {
      console.log(
        `\n⚠️ WARNING: You cannot afford any course with grade ${alternateGrade} if you want to maintain a GPA of ${targetGPA.toFixed(
          2
        )}.`
      );
    } else if (maxCoursesWithAlternateGrade === totalRemainingCourses) {
      console.log(
        `\n✅ Good news! You can get ${alternateGrade} in all your remaining courses and still maintain a GPA of ${targetGPA.toFixed(
          2
        )}.`
      );
    }
  },
};
