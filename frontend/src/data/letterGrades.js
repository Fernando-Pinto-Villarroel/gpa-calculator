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
      return "text-green-400 bg-green-500/20 border-green-500/30";
    case "A-":
      return "text-green-400 bg-green-500/20 border-green-500/30";
    case "B+":
      return "text-jala-blue-400 bg-jala-blue-500/20 border-jala-blue-500/30";
    case "B":
      return "text-jala-blue-400 bg-jala-blue-500/20 border-jala-blue-500/30";
    case "B-":
      return "text-jala-blue-400 bg-jala-blue-500/20 border-jala-blue-500/30";
    case "C+":
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    case "C":
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    case "C-":
      return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
    case "D+":
      return "text-orange-400 bg-orange-500/20 border-orange-500/30";
    case "D":
      return "text-orange-400 bg-orange-500/20 border-orange-500/30";
    case "D-":
      return "text-orange-400 bg-orange-500/20 border-orange-500/30";
    case "F":
      return "text-red-400 bg-red-500/20 border-red-500/30";
    default:
      return "text-cosmic-300 bg-cosmic-800/40 border-cosmic-600/50";
  }
};
