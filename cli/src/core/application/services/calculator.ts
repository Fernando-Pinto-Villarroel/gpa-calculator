import { courseCredits } from "../../../data/data.js";
import { Course } from "../../domain/types/course.js";
import {
  LetterGrade,
  letterGradesMap,
} from "../../domain/types/letterGrades.js";
import { objectEntries, objectValues } from "../utils/utils.js";
import { courseUtils } from "../utils/courseUtils.js";

function shouldExcludeFromGPA(course: Course): boolean {
  if (!course.courseCode) return false;

  const isESPCourse = course.courseCode.startsWith("ESP");
  const isLabCourse = course.name.toLowerCase().includes("lab");
  const isEnglish1 = course.name === "English 1";

  return isESPCourse && isLabCourse && !isEnglish1;
}

export function calculateBasicStats() {
  const numYears = Object.keys(courseCredits).length;

  const numSemesters = objectValues(courseCredits).reduce(
    (acc, year) => acc + Object.keys(year).length,
    0
  );

  const numModulesPerSemester = Object.fromEntries(
    objectEntries(courseCredits).flatMap(([yearName, semesters]) =>
      objectEntries(semesters).map(([semesterName, modules]) => [
        `${yearName} - ${semesterName}`,
        Object.keys(modules).length,
      ])
    )
  );

  const totalCourses = objectValues(courseCredits).reduce((yearAcc, year) => {
    return (
      yearAcc +
      objectValues(year).reduce((semesterAcc, semester) => {
        return (
          semesterAcc +
          objectValues(semester).reduce((moduleAcc, module) => {
            return moduleAcc + module.length;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const creditsPerSemester = Object.fromEntries(
    objectEntries(courseCredits).flatMap(([yearName, semesters]) =>
      objectEntries(semesters).map(([semesterName, modules]) => [
        `${yearName} - ${semesterName}`,
        objectValues(modules).reduce((acc, module) => {
          return acc + module.reduce((sum, course) => sum + course.credits, 0);
        }, 0),
      ])
    )
  );

  const totalCredits = objectValues(creditsPerSemester).reduce(
    (acc, val) => acc + val,
    0
  );

  return {
    numYears,
    numSemesters,
    numModulesPerSemester,
    totalCourses,
    creditsPerSemester,
    totalCredits,
  };
}

export function calculateCurrentGPA(): {
  gpa: number;
  completedCredits: number;
  totalCompletedCourses: number;
} {
  let totalQualityPoints = 0;
  let totalAttemptedCredits = 0;
  let totalCompletedCourses = 0;

  objectValues(courseCredits).forEach((year) => {
    objectValues(year).forEach((semester) => {
      objectValues(semester).forEach((module: Course[]) => {
        module.forEach((course: Course) => {
          if (course.grade && !shouldExcludeFromGPA(course)) {
            const gradePoints = letterGradesMap[course.grade];
            const qualityPoints = gradePoints * course.credits;
            totalQualityPoints += qualityPoints;
            totalAttemptedCredits += course.credits;
            totalCompletedCourses++;
          }
        });
      });
    });
  });

  const gpa =
    totalAttemptedCredits > 0 ? totalQualityPoints / totalAttemptedCredits : 0;
  return {
    gpa,
    completedCredits: totalAttemptedCredits,
    totalCompletedCourses,
  };
}

export function getRemainingCourses(): {
  courses: Course[];
  totalCredits: number;
} {
  const remainingCourses: Course[] = [];
  let totalRemainingCredits = 0;

  objectValues(courseCredits).forEach((year) => {
    objectValues(year).forEach((semester) => {
      objectValues(semester).forEach((module: Course[]) => {
        module.forEach((course: Course) => {
          if (!course.grade) {
            remainingCourses.push(course);
            totalRemainingCredits += course.credits;
          }
        });
      });
    });
  });

  return { courses: remainingCourses, totalCredits: totalRemainingCredits };
}

export function calculateModuleStats() {
  const completedByModule = courseUtils.getCompletedCoursesByModule();
  const remainingByModule = courseUtils.getRemainingCoursesByModule();

  const moduleStats = Object.keys(completedByModule).reduce(
    (acc, moduleName) => {
      const completed = completedByModule[moduleName].filter(
        (course) => !shouldExcludeFromGPA(course)
      );
      const remaining = remainingByModule[moduleName];

      const completedCredits = completed.reduce(
        (sum, course) => sum + course.credits,
        0
      );
      const remainingCredits = remaining.reduce(
        (sum, course) => sum + course.credits,
        0
      );
      const totalCredits = completedCredits + remainingCredits;

      let moduleGPA = 0;
      if (completed.length > 0) {
        const totalQualityPoints = completed.reduce((sum, course) => {
          return sum + letterGradesMap[course.grade!] * course.credits;
        }, 0);
        moduleGPA =
          completedCredits > 0 ? totalQualityPoints / completedCredits : 0;
      }

      acc[moduleName] = {
        completedCourses: completed.length,
        remainingCourses: remaining.length,
        totalCourses: completed.length + remaining.length,
        completedCredits,
        remainingCredits,
        totalCredits,
        moduleGPA,
      };

      return acc;
    },
    {} as Record<string, any>
  );

  return moduleStats;
}

export function calculateMaxCoursesWithGrade(
  targetGPA: number,
  defaultGrade: LetterGrade,
  alternateGrade: LetterGrade
): number {
  const { gpa: currentGPA, completedCredits } = calculateCurrentGPA();
  const { courses: remainingCourses, totalCredits: remainingCredits } =
    getRemainingCourses();

  if (remainingCourses.length === 0) {
    return 0;
  }

  const defaultGradePoints = letterGradesMap[defaultGrade];
  const alternateGradePoints = letterGradesMap[alternateGrade];

  const isAlternateLower = alternateGradePoints < defaultGradePoints;

  if (isAlternateLower) {
    const currentQualityPoints = currentGPA * completedCredits;
    const targetQualityPoints =
      targetGPA * (completedCredits + remainingCredits);
    const defaultQualityPoints = defaultGradePoints * remainingCredits;

    const maxAlternateCredits = Math.floor(
      (currentQualityPoints + defaultQualityPoints - targetQualityPoints) /
        (defaultGradePoints - alternateGradePoints)
    );

    let creditsAssigned = 0;
    let coursesWithAlternateGrade = 0;

    const sortedCourses = [...remainingCourses].sort(
      (a, b) => a.credits - b.credits
    );

    for (const course of sortedCourses) {
      if (creditsAssigned + course.credits <= maxAlternateCredits) {
        creditsAssigned += course.credits;
        coursesWithAlternateGrade++;
      } else {
        break;
      }
    }

    return coursesWithAlternateGrade;
  } else {
    return remainingCourses.length;
  }
}
