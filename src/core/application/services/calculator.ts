import { courseCredits } from "../../../data/data.js";
import { Course } from "../../domain/types/course.js";
import {
  LetterGrade,
  letterGradesMap,
} from "../../domain/types/letterGrades.js";
import { objectEntries, objectValues } from "../utils/utils.js";

export function calculateBasicStats() {
  const numAnios = Object.keys(courseCredits).length;

  const numSemestres = objectValues(courseCredits).reduce(
    (acc, year) => acc + Object.keys(year).length,
    0
  );

  const numMateriasPorSemestre = Object.fromEntries(
    objectEntries(courseCredits).flatMap(([year, semestres]) =>
      objectEntries(semestres).map(([semestre, materias]) => [
        semestre,
        materias.length,
      ])
    )
  );

  const numMateriasTotal = objectValues(numMateriasPorSemestre).reduce(
    (acc, val) => acc + val,
    0
  );

  const creditosPorSemestre = Object.fromEntries(
    objectEntries(courseCredits).flatMap(([year, semestres]) =>
      objectEntries(semestres).map(([semestre, materias]) => [
        semestre,
        materias.reduce((sum, mat) => sum + mat.creditos, 0),
      ])
    )
  );

  const creditosTotal = objectValues(creditosPorSemestre).reduce(
    (acc, val) => acc + val,
    0
  );

  return {
    numAnios,
    numSemestres,
    numMateriasPorSemestre,
    numMateriasTotal,
    creditosPorSemestre,
    creditosTotal,
  };
}

/**
 * Calcula el GPA actual basado en cursos completados
 */
export function calculateCurrentGPA(): {
  gpa: number;
  completedCredits: number;
  totalCompletedCourses: number;
} {
  let totalPoints = 0;
  let totalCredits = 0;
  let totalCompletedCourses = 0;

  objectValues(courseCredits).forEach((year) => {
    objectValues(year).forEach((semester) => {
      semester.forEach((course) => {
        if (course.grade) {
          const gradePoints = letterGradesMap[course.grade] * course.creditos;
          totalPoints += gradePoints;
          totalCredits += course.creditos;
          totalCompletedCourses++;
        }
      });
    });
  });

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
  return { gpa, completedCredits: totalCredits, totalCompletedCourses };
}

export function getRemainingCourses(): {
  courses: Course[];
  totalCredits: number;
} {
  const remainingCourses: Course[] = [];
  let totalRemainingCredits = 0;

  objectValues(courseCredits).forEach((year) => {
    objectValues(year).forEach((semester) => {
      semester.forEach((course) => {
        if (!course.grade) {
          remainingCourses.push(course);
          totalRemainingCredits += course.creditos;
        }
      });
    });
  });

  return { courses: remainingCourses, totalCredits: totalRemainingCredits };
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
    const maxAlternateCredits = Math.floor(
      (currentGPA * completedCredits +
        defaultGradePoints * remainingCredits -
        targetGPA * (completedCredits + remainingCredits)) /
        (defaultGradePoints - alternateGradePoints)
    );

    let creditsAssigned = 0;
    let coursesWithAlternateGrade = 0;

    const sortedCourses = [...remainingCourses].sort(
      (a, b) => a.creditos - b.creditos
    );

    for (const course of sortedCourses) {
      if (creditsAssigned + course.creditos <= maxAlternateCredits) {
        creditsAssigned += course.creditos;
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
