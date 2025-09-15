import { LETTER_GRADES_MAP } from "@data/letterGrades";

export const validationUtils = {
  isValidGPA(gpa) {
    const numGPA = Number(gpa);
    return !isNaN(numGPA) && numGPA >= 0 && numGPA <= 4.0;
  },

  isValidGrade(grade) {
    return Object.keys(LETTER_GRADES_MAP).includes(grade);
  },

  isValidCredits(credits) {
    const numCredits = Number(credits);
    return !isNaN(numCredits) && numCredits > 0 && numCredits <= 12;
  },

  validateImportData(data) {
    const errors = [];

    if (!data || typeof data !== "object") {
      errors.push("Invalid data format");
      return { isValid: false, errors };
    }

    if (data.selectedTerm && typeof data.selectedTerm !== "string") {
      errors.push("Invalid selected term format");
    }

    if (data.grades && typeof data.grades !== "object") {
      errors.push("Invalid grades format");
    }

    if (data.grades) {
      Object.entries(data.grades).forEach(([courseId, grade]) => {
        if (typeof courseId !== "string" || !this.isValidGrade(grade)) {
          errors.push(`Invalid grade "${grade}" for course "${courseId}"`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  sanitizeGradeData(grades) {
    const sanitized = {};

    Object.entries(grades || {}).forEach(([courseId, grade]) => {
      if (typeof courseId === "string" && this.isValidGrade(grade)) {
        sanitized[courseId] = grade;
      }
    });

    return sanitized;
  },
};
