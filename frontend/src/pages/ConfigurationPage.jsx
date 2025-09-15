import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useGpa } from "@contexts/GpaContext";
import TermSelector from "@components/TermSelector";
import CourseGradeEditor from "@components/CourseGradeEditor";
import ImportExportSection from "@components/ImportExportSection";

function ConfigurationPage() {
  const { selectedTerm, termStructure, grades, resetGrades } = useGpa();
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetGrades = async () => {
    setIsResetting(true);

    setTimeout(() => {
      resetGrades();
      setIsResetting(false);
      setShowResetConfirm(false);
    }, 1000);
  };

  const totalCourses = Object.values(termStructure).reduce(
    (yearTotal, year) => {
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
    },
    0
  );

  const gradedCourses = Object.keys(grades).filter(
    (courseId) => grades[courseId] && grades[courseId] !== "-"
  ).length;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-jala-blue-900 mb-2">
          Configuration
        </h1>
        <p className="text-lg text-jala-blue-600">
          Manage your subjects and grades
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Term Structure</h2>
            <p className="text-gray-600 mt-1">
              Select your enrollment term and assign grades
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
            <div className="text-sm text-gray-600">
              {gradedCourses} of {totalCourses} courses graded
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw
                  className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`}
                />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>

        <TermSelector />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Grades</h2>
        <CourseGradeEditor />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Data Management
        </h2>
        <ImportExportSection />
      </motion.div>

      {showResetConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reset All Grades?
            </h3>
            <p className="text-gray-600 mb-6">
              This will remove all assigned grades from all courses. This action
              cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetGrades}
                disabled={isResetting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default ConfigurationPage;
