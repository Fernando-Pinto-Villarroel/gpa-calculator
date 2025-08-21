import { courseCredits } from "../../../data/data.js";
import { Course } from "../../domain/types/course.js";
import { Module } from "../../domain/types/module.js";
import { objectValues, objectEntries } from "./utils.js";

export const courseUtils = {
  getAllCourses(): Course[] {
    const allCourses: Course[] = [];

    objectValues(courseCredits).forEach((year) => {
      objectValues(year).forEach((semester) => {
        objectValues(semester).forEach((module: Course[]) => {
          allCourses.push(...module);
        });
      });
    });

    return allCourses;
  },

  getCoursesByModule(moduleName: string): Course[] {
    const modulesCourses: Course[] = [];

    objectValues(courseCredits).forEach((year) => {
      objectValues(year).forEach((semester) => {
        objectEntries(semester).forEach(([modName, module]) => {
          if (modName === moduleName) {
            modulesCourses.push(...module);
          }
        });
      });
    });

    return modulesCourses;
  },

  getModulesBySemester(yearName: string, semesterName: string): Course[][] {
    const year = courseCredits[yearName];
    if (!year) return [];

    const semester = year[semesterName];
    if (!semester) return [];

    return objectValues(semester);
  },

  getCompletedCoursesByModule(): Record<string, Course[]> {
    const completedByModule: Record<string, Course[]> = {
      "Module 1": [],
      "Module 2": [],
      "Module 3": [],
    };

    objectValues(courseCredits).forEach((year) => {
      objectValues(year).forEach((semester) => {
        objectEntries(semester).forEach(([moduleName, module]) => {
          const completedCourses = module.filter(
            (course: Course) => course.grade
          );
          if (completedByModule[moduleName]) {
            completedByModule[moduleName].push(...completedCourses);
          }
        });
      });
    });

    return completedByModule;
  },

  getRemainingCoursesByModule(): Record<string, Course[]> {
    const remainingByModule: Record<string, Course[]> = {
      "Module 1": [],
      "Module 2": [],
      "Module 3": [],
    };

    objectValues(courseCredits).forEach((year) => {
      objectValues(year).forEach((semester) => {
        objectEntries(semester).forEach(([moduleName, module]) => {
          const remainingCourses = module.filter(
            (course: Course) => !course.grade
          );
          if (remainingByModule[moduleName]) {
            remainingByModule[moduleName].push(...remainingCourses);
          }
        });
      });
    });

    return remainingByModule;
  },
};
