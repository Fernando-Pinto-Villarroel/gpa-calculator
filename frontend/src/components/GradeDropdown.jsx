import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  LETTER_GRADES,
  getGradeColor,
  LETTER_GRADES_MAP,
} from "@data/letterGrades";

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 min-w-[100px] ${
          currentGrade === "-"
            ? "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
            : `${getGradeColor(currentGrade)} hover:shadow-sm`
        }`}
      >
        <span className="font-medium min-w-[24px] text-center">
          {currentGrade === "-" ? "Set" : currentGrade}
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
            className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2"
          >
            <div className="max-h-72 overflow-y-auto">
              {LETTER_GRADES.map((grade) => {
                const points = getGradePoints(grade);
                const isSelected = currentGrade === grade;

                return (
                  <motion.button
                    key={grade}
                    onClick={() => handleGradeSelect(grade)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-jala-blue-50 text-jala-blue-700"
                        : "text-gray-700"
                    }`}
                    whileHover={{
                      backgroundColor: isSelected
                        ? "rgb(239 246 255)"
                        : "rgb(249 250 251)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="font-medium min-w-[32px]">
                        {grade === "-" ? "None" : grade}
                      </span>
                      {points !== null && (
                        <span className="text-sm text-gray-500">
                          ({points.toFixed(1)} points)
                        </span>
                      )}
                    </span>

                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-jala-blue-500 rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 mt-2 pt-2 px-4">
              <div className="text-xs text-gray-500">
                <div className="flex justify-between mb-1">
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
