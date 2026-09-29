import { Term } from "@/core/domain/types/course";
import { CourseGradeEntry, isCourseApproved } from "@/core/domain/types/grades";
import { isPendingOptionalCourse } from "@/features/gpa/services/calculator";

const ESP_COURSE_TYPE = "Core";

export interface EspCompletion {
  completedCourses: number;
  totalCourses: number;
  completionPercent: number;
}

export interface EspLevelCompletion {
  termOrdinal: string;
  coursesCompleted: number;
  coursesPending: number;
  totalCourses: number;
}

export interface EspLevelsCompleted {
  completed: number;
  total: number;
}

export function calculateEspCompletionByLevel(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): EspLevelCompletion[] {
  return terms.map((term) => {
    const applicableCourses = Object.values(term.modules)
      .flat()
      .filter(
        (course) =>
          course.type === ESP_COURSE_TYPE &&
          !isPendingOptionalCourse(course, grades[course.courseCode] ?? null),
      );
    const coursesCompleted = applicableCourses.filter((course) =>
      isCourseApproved(grades[course.courseCode] ?? null),
    ).length;

    return {
      termOrdinal: term.ordinal,
      coursesCompleted,
      coursesPending: applicableCourses.length - coursesCompleted,
      totalCourses: applicableCourses.length,
    };
  });
}

export function calculateEspCompletion(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): EspCompletion {
  const levels = calculateEspCompletionByLevel(grades, terms);
  const completedCourses = levels.reduce((sum, l) => sum + l.coursesCompleted, 0);
  const totalCourses = levels.reduce((sum, l) => sum + l.totalCourses, 0);

  return {
    completedCourses,
    totalCourses,
    completionPercent:
      totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
  };
}

export function calculateEspLevelsCompleted(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): EspLevelsCompleted {
  const applicableLevels = calculateEspCompletionByLevel(grades, terms).filter(
    (level) => level.totalCourses > 0,
  );

  return {
    completed: applicableLevels.filter((level) => level.coursesPending === 0).length,
    total: applicableLevels.length,
  };
}

export function calculateEspLabCompletion(
  grades: Record<string, CourseGradeEntry>,
  terms: Term[],
): EspCompletion {
  const applicableLabs = terms
    .flatMap((term) => Object.values(term.modules).flat())
    .filter(
      (course) =>
        course.type !== ESP_COURSE_TYPE &&
        !isPendingOptionalCourse(course, grades[course.courseCode] ?? null),
    );
  const completedCourses = applicableLabs.filter((course) =>
    isCourseApproved(grades[course.courseCode] ?? null),
  ).length;
  const totalCourses = applicableLabs.length;

  return {
    completedCourses,
    totalCourses,
    completionPercent:
      totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
  };
}
