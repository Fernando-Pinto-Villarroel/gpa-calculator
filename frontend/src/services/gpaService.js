import { LETTER_GRADES_MAP } from "../data/letterGrades";

export const gpaService = {
  calculateGPA(courses, grades) {
    let totalQualityPoints = 0;
    let totalCredits = 0;
    let completedCourses = 0;

    courses.forEach((course) => {
      const courseId = `${course.courseCode}-${course.name}`;
      const grade = grades[courseId];

      if (grade && grade !== "-" && LETTER_GRADES_MAP[grade] !== null) {
        const gradePoints = LETTER_GRADES_MAP[grade];
        totalQualityPoints += gradePoints * course.credits;
        totalCredits += course.credits;
        completedCourses++;
      }
    });

    const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;

    return {
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      completedCourses,
      totalQualityPoints,
    };
  },

  getHonorsLevel(gpa) {
    if (gpa >= 3.9) {
      return {
        level: "Summa Cum Laude",
        description: "Highest Honors",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    } else if (gpa >= 3.7) {
      return {
        level: "Magna Cum Laude",
        description: "High Honors",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    } else if (gpa >= 3.5) {
      return {
        level: "Cum Laude",
        description: "With Honors",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    }
    return null;
  },

  getAllCourses(termStructure) {
    const courses = [];

    Object.entries(termStructure).forEach(([yearName, year]) => {
      Object.entries(year).forEach(([semesterName, semester]) => {
        Object.entries(semester).forEach(([moduleName, module]) => {
          module.forEach((course) => {
            courses.push({
              ...course,
              yearName,
              semesterName,
              moduleName,
              id: `${course.courseCode}-${course.name}`,
            });
          });
        });
      });
    });

    return courses;
  },

  getCourseStats(termStructure, grades) {
    const courses = this.getAllCourses(termStructure);
    const gpaData = this.calculateGPA(courses, grades);

    const totalCourses = courses.length;
    const completedCourses = gpaData.completedCourses;
    const remainingCourses = totalCourses - completedCourses;

    const totalPossibleCredits = courses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    const remainingCredits = totalPossibleCredits - gpaData.totalCredits;

    return {
      ...gpaData,
      totalCourses,
      remainingCourses,
      totalPossibleCredits,
      remainingCredits,
      completionPercentage:
        totalCourses > 0
          ? Math.round((completedCourses / totalCourses) * 100)
          : 0,
    };
  },

  calculateRequiredGradeForTarget(termStructure, grades, targetGPA) {
    const courses = this.getAllCourses(termStructure);
    const currentStats = this.getCourseStats(termStructure, grades);

    if (currentStats.remainingCourses === 0) {
      return null;
    }

    const requiredTotalQualityPoints =
      targetGPA * currentStats.totalPossibleCredits;
    const remainingQualityPointsNeeded =
      requiredTotalQualityPoints - currentStats.totalQualityPoints;
    const averageGradeNeeded =
      remainingQualityPointsNeeded / currentStats.remainingCredits;

    return Math.max(0, Math.min(4.0, averageGradeNeeded));
  },
};
