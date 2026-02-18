import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { LETTER_GRADES, LETTER_GRADES_MAP } from "../data/letterGrades";

function GradeDropdown({ currentGrade, onGradeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGradeSelect = (grade) => {
    onGradeChange(grade);
    setIsOpen(false);
  };

  const getGradePoints = (grade) => {
    if (grade === "-") return null;
    return LETTER_GRADES_MAP[grade];
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
      case "A-":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "B+":
      case "B":
      case "B-":
        return "text-jala-blue-400 bg-jala-blue-500/20 border-jala-blue-500/30";
      case "C+":
      case "C":
      case "C-":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "D+":
      case "D":
      case "D-":
        return "text-orange-400 bg-orange-500/20 border-orange-500/30";
      case "F":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-cosmic-300 bg-cosmic-800/40 border-cosmic-600/50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 min-w-[120px] backdrop-blur-sm ${
          currentGrade === "-"
            ? "bg-cosmic-800/40 border-cosmic-600/50 text-cosmic-300 hover:border-jala-blue-500/50"
            : `${getGradeColor(
                currentGrade
              )} hover:shadow-lg hover:shadow-current/20`
        }`}
      >
        <span className="font-medium flex-1 text-center">
          {currentGrade === "-" ? "Assign" : currentGrade}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-64 bg-cosmic-900/95 backdrop-blur-xl border border-cosmic-700/50 rounded-xl shadow-2xl z-50 py-3"
          >
            <div className="max-h-80 overflow-y-auto">
              {LETTER_GRADES.map((grade) => {
                const points = getGradePoints(grade);
                const isSelected = currentGrade === grade;

                return (
                  <motion.button
                    key={grade}
                    onClick={() => handleGradeSelect(grade)}
                    className={`w-full px-4 py-3 text-left hover:bg-cosmic-800/50 transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-jala-blue-600/20 text-jala-blue-300"
                        : "text-cosmic-200"
                    }`}
                    whileHover={{
                      backgroundColor: isSelected
                        ? "rgba(37, 99, 235, 0.2)"
                        : "rgba(71, 85, 105, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="font-medium min-w-[36px]">
                        {grade === "-" ? "None" : grade}
                      </span>
                      {points !== null && (
                        <span className="text-sm text-cosmic-400">
                          ({points.toFixed(1)} points)
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-jala-blue-400 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="border-t border-cosmic-700/50 mt-3 pt-3 px-4">
              <div className="text-xs text-cosmic-400">
                <div className="flex justify-between mb-2">
                  <span>A = 4.0</span>
                  <span>B = 3.0</span>
                  <span>C = 2.0</span>
                </div>
                <div className="text-center">Grade Point Average Scale</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GradeDropdown;
