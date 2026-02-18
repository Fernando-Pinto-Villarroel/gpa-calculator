import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";
import { useGpa } from "../contexts/GpaContext";
import { TERM_STRUCTURES } from "../data/termStructures";

function TermToggle() {
  const { selectedTerm, setSelectedTerm } = useGpa();

  const termDescriptions = {
    "Term 1-2023": "Basic foundation courses - First semester only",
    "Term 2-2023": "Extended program - Two semesters included",
    "Term 1-2024": "Updated curriculum - Three semesters available",
    "Term 2-2024+": "Complete program structure - All four years included",
  };

  const getCourseCount = (termStructure) => {
    return Object.values(termStructure).reduce((yearTotal, year) => {
      return (
        yearTotal +
        Object.values(year).reduce((semesterTotal, semester) => {
          return (
            semesterTotal +
            Object.values(semester).reduce((moduleTotal, module) => {
              return moduleTotal + module.length;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-jala-blue-400" />
        <h3 className="text-lg font-semibold text-white">
          Select Your Term Structure
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.keys(TERM_STRUCTURES).map((term) => {
          const isSelected = selectedTerm === term;
          const courseCount = getCourseCount(TERM_STRUCTURES[term]);

          return (
            <motion.button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`px-6 py-3 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? "border-jala-blue-500 bg-jala-blue-600/20 text-jala-blue-300 backdrop-blur-sm"
                  : "border-cosmic-700 bg-cosmic-800/30 text-cosmic-300 hover:border-jala-blue-600/50 hover:bg-jala-blue-600/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{term}</span>
                {isSelected && <CheckCircle className="w-4 h-4" />}
              </div>
              <div className="text-xs mt-1 opacity-80">
                {courseCount} courses
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="bg-jala-blue-600/10 backdrop-blur-sm rounded-lg p-4 border border-jala-blue-500/20">
        <h4 className="font-medium text-jala-blue-300 mb-2">
          About Term Structures
        </h4>
        <p className="text-sm text-cosmic-300">
          {termDescriptions[selectedTerm]}
        </p>
      </div>
    </div>
  );
}

export default TermToggle;
