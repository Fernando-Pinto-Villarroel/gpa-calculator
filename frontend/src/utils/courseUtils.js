export const courseUtils = {
  generateCourseId(course) {
    return `${course.courseCode}-${course.name}`;
  },

  shouldExcludeFromGPA(course) {
    if (!course.courseCode) return false;

    const isESPCourse = course.courseCode.startsWith("ESP");
    const isLabCourse = course.name.toLowerCase().includes("lab");
    const isEnglish1 = course.name === "English 1";

    return isESPCourse && isLabCourse && !isEnglish1;
  },

  formatCredits(credits) {
    return `${credits} credit${credits !== 1 ? "s" : ""}`;
  },

  getCoursesByYear(termStructure, yearName) {
    const year = termStructure[yearName];
    if (!year) return [];

    const courses = [];
    Object.entries(year).forEach(([semesterName, semester]) => {
      Object.entries(semester).forEach(([moduleName, module]) => {
        module.forEach((course) => {
          courses.push({
            ...course,
            yearName,
            semesterName,
            moduleName,
            id: this.generateCourseId(course),
          });
        });
      });
    });

    return courses;
  },

  getCoursesBySemester(termStructure, yearName, semesterName) {
    const year = termStructure[yearName];
    if (!year) return [];

    const semester = year[semesterName];
    if (!semester) return [];

    const courses = [];
    Object.entries(semester).forEach(([moduleName, module]) => {
      module.forEach((course) => {
        courses.push({
          ...course,
          yearName,
          semesterName,
          moduleName,
          id: this.generateCourseId(course),
        });
      });
    });

    return courses;
  },

  getCoursesByModule(termStructure, yearName, semesterName, moduleName) {
    const year = termStructure[yearName];
    if (!year) return [];

    const semester = year[semesterName];
    if (!semester) return [];

    const module = semester[moduleName];
    if (!module) return [];

    return module.map((course) => ({
      ...course,
      yearName,
      semesterName,
      moduleName,
      id: this.generateCourseId(course),
    }));
  },
};
