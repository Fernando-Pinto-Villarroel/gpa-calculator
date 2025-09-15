export const LETTER_GRADES_MAP = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
  "-": null,
};

export const LETTER_GRADES = Object.keys(LETTER_GRADES_MAP);

export const getGradeColor = (grade) => {
  switch (grade) {
    case "A":
      return "text-green-600 bg-green-50 border-green-200";
    case "A-":
      return "text-green-600 bg-green-50 border-green-200";
    case "B+":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "B":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "B-":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "C+":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "C":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "C-":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "D+":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "D":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "D-":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "F":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};
