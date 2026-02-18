import React from "react";
import { motion } from "framer-motion";
import { Book } from "lucide-react";
import { useGpa } from "../contexts/GpaContext";
import GradeDropdown from "./GradeDropdown";

function CourseGrid() {
  const { termStructure, grades, updateGrade } = useGpa();

  const getAllCourses = () => {
    const courses = [];
    Object.entries(termStructure).forEach(([yearName, year]) => {
      Object.entries(year).forEach(([semesterName, semester]) => {
        Object.entries(semester).forEach(([moduleName, module]) => {
          module.forEach((course) => {
            courses.push({
              ...course,
              yearName,
              semesterName,
              moduleName,
              id: `${course.courseCode}-${course.name}`,
            });
          });
        });
      });
    });
    return courses;
  };

  const courses = getAllCourses();

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="w-12 h-12 text-cosmic-400 mx-auto mb-4" />
        <p className="text-cosmic-300">
          No courses available for the selected term.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(termStructure).map(([yearName, year]) => (
        <motion.div
          key={yearName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white border-b border-cosmic-700/50 pb-2">
            {yearName}
          </h3>

          {Object.entries(year).map(([semesterName, semester]) => (
            <div key={semesterName} className="space-y-4">
              <h4 className="text-lg font-medium text-cosmic-300">
                {semesterName}
              </h4>

              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4 min-w-max">
                  {Object.entries(semester).map(
                    ([moduleName, coursesInModule]) => (
                      <div key={moduleName} className="min-w-[300px] space-y-3">
                        <h5 className="text-sm font-medium text-jala-blue-300 bg-jala-blue-600/10 rounded-lg px-3 py-2 text-center">
                          {moduleName}
                        </h5>

                        <div className="space-y-2">
                          {coursesInModule.map((course, index) => {
                            const courseId = `${course.courseCode}-${course.name}`;
                            const currentGrade = grades[courseId] || "-";

                            return (
                              <motion.div
                                key={courseId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-cosmic-800/40 backdrop-blur-sm rounded-lg p-4 border border-cosmic-700/50 hover:border-jala-blue-600/50 transition-colors"
                              >
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-xs font-mono text-jala-blue-400 bg-jala-blue-600/20 px-2 py-1 rounded">
                                        {course.courseCode}
                                      </span>
                                      <span className="text-xs text-cosmic-400">
                                        {course.credits} credit
                                        {course.credits !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <h6 className="font-medium text-white text-sm leading-tight">
                                      {course.name}
                                    </h6>
                                  </div>

                                  <div className="flex justify-center">
                                    <GradeDropdown
                                      currentGrade={currentGrade}
                                      onGradeChange={(grade) =>
                                        updateGrade(courseId, grade)
                                      }
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export default CourseGrid;
