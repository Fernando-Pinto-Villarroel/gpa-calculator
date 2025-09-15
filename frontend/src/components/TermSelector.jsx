import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";
import { useGpa } from "@contexts/GpaContext";
import { TERM_STRUCTURES } from "@data/termStructures";

function TermSelector() {
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
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="w-6 h-6 text-jala-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Select Your Term Structure
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(TERM_STRUCTURES).map((term) => {
          const isSelected = selectedTerm === term;
          const courseCount = getCourseCount(TERM_STRUCTURES[term]);

          return (
            <motion.button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? "border-jala-blue-500 bg-jala-blue-50"
                  : "border-gray-200 bg-white hover:border-jala-blue-300 hover:bg-jala-blue-25"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`font-semibold ${
                        isSelected ? "text-jala-blue-900" : "text-gray-900"
                      }`}
                    >
                      {term}
                    </h4>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-jala-blue-600" />
                    )}
                  </div>

                  <p
                    className={`text-sm mt-1 ${
                      isSelected ? "text-jala-blue-700" : "text-gray-600"
                    }`}
                  >
                    {termDescriptions[term]}
                  </p>

                  <div className="flex items-center space-x-4 mt-3 text-sm">
                    <span
                      className={`${
                        isSelected ? "text-jala-blue-600" : "text-gray-500"
                      }`}
                    >
                      {courseCount} courses
                    </span>

                    <span
                      className={`${
                        isSelected ? "text-jala-blue-600" : "text-gray-500"
                      }`}
                    >
                      {Object.keys(TERM_STRUCTURES[term]).length} year
                      {Object.keys(TERM_STRUCTURES[term]).length > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-jala-blue-500 bg-opacity-5 rounded-xl pointer-events-none"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="bg-jala-blue-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-jala-blue-900 mb-2">
          About Term Structures
        </h4>
        <p className="text-sm text-jala-blue-700">
          Each term represents the official course structure for students
          enrolled during that period. Select the term that matches your
          enrollment to see the correct subjects and requirements.
        </p>
      </div>
    </div>
  );
}

export default TermSelector;
