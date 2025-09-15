import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Book } from "lucide-react";
import { useGpa } from "@contexts/GpaContext";
import { getGradeColor } from "@data/letterGrades";
import GradeDropdown from "./GradeDropdown";

function CourseGradeEditor() {
  const { termStructure, grades, updateGrade } = useGpa();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const getSectionStats = (courses) => {
    const total = courses.length;
    const graded = courses.filter((course) => {
      const courseId = `${course.courseCode}-${course.name}`;
      return grades[courseId] && grades[courseId] !== "-";
    }).length;
    return { total, graded };
  };

  if (Object.keys(termStructure).length === 0) {
    return (
      <div className="text-center py-8">
        <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          No courses available for the selected term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(termStructure).map(([yearName, year]) => (
        <motion.div
          key={yearName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggleSection(yearName)}
            className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-jala-blue-100 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-jala-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {yearName}
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {Object.values(year).reduce(
                  (acc, semester) =>
                    acc +
                    Object.values(semester).reduce(
                      (semAcc, module) => semAcc + module.length,
                      0
                    ),
                  0
                )}{" "}
                courses
              </span>
              {expandedSections[yearName] ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expandedSections[yearName] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white"
              >
                <div className="p-6 space-y-6">
                  {Object.entries(year).map(([semesterName, semester]) => (
                    <div key={semesterName} className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        {semesterName}
                      </h4>

                      {Object.entries(semester).map(([moduleName, courses]) => {
                        const stats = getSectionStats(courses);

                        return (
                          <div
                            key={moduleName}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-700">
                                {moduleName}
                              </h5>
                              <span className="text-sm text-gray-500">
                                {stats.graded}/{stats.total} graded
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              {courses.map((course, index) => {
                                const courseId = `${course.courseCode}-${course.name}`;
                                const currentGrade = grades[courseId] || "-";

                                return (
                                  <motion.div
                                    key={courseId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-3">
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {course.courseCode}
                                        </span>
                                        <h6 className="font-medium text-gray-900 truncate">
                                          {course.name}
                                        </h6>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">
                                        {course.credits} credit
                                        {course.credits !== 1 ? "s" : ""}
                                      </p>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                      {currentGrade !== "-" && (
                                        <div
                                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getGradeColor(
                                            currentGrade
                                          )}`}
                                        >
                                          {currentGrade}
                                        </div>
                                      )}

                                      <GradeDropdown
                                        currentGrade={currentGrade}
                                        onGradeChange={(grade) =>
                                          updateGrade(courseId, grade)
                                        }
                                      />
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

export default CourseGradeEditor;
