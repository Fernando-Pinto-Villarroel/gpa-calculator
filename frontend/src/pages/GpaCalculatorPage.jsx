import { useState } from "react";
import { motion } from "framer-motion";
import { Star, BookOpen, Target, TrendingUp } from "lucide-react";
import { useGpaCalculator } from "@hooks/useGpaCalculator";
import GPADisplay from "@components/GPADisplay";
import HonorsDisplay from "@components/HonorsDisplay";
import StatsCard from "@components/StatsCard";
import ProgressBar from "@components/ProgressBar";
import RequiredGradeCalculator from "@components/RequiredGradeCalculator";

function GpaCalculatorPage() {
  const { gpaData, honorsLevel } = useGpaCalculator();
  const [showRequiredGrade, setShowRequiredGrade] = useState(false);

  const stats = [
    {
      title: "Completed Courses",
      value: gpaData.completedCourses,
      total: gpaData.totalCourses,
      icon: BookOpen,
      color: "jala-blue",
    },
    {
      title: "Total Credits",
      value: gpaData.totalCredits,
      total: gpaData.totalPossibleCredits,
      icon: Star,
      color: "jala-cyan",
    },
    {
      title: "Quality Points",
      value: Math.round(gpaData.totalQualityPoints * 10) / 10,
      icon: TrendingUp,
      color: "green",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-jala-blue-900 mb-2">
          GPA Calculator
        </h1>
        <p className="text-lg text-jala-blue-600">
          Track your academic progress and achievements
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GPADisplay gpa={gpaData.gpa} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {honorsLevel && <HonorsDisplay honorsLevel={honorsLevel} />}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Academic Progress
        </h2>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Course Completion
            </span>
            <span className="text-sm text-gray-500">
              {gpaData.completedCourses} / {gpaData.totalCourses}
            </span>
          </div>
          <ProgressBar
            value={gpaData.completionPercentage}
            color="jala-blue"
            animated={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Grade Planning</h2>
          <button
            onClick={() => setShowRequiredGrade(!showRequiredGrade)}
            className="flex items-center space-x-2 px-4 py-2 bg-jala-blue-500 text-white rounded-lg hover:bg-jala-blue-600 transition-colors"
          >
            <Target className="w-5 h-5" />
            <span>Target GPA</span>
          </button>
        </div>

        {showRequiredGrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RequiredGradeCalculator />
          </motion.div>
        )}

        {gpaData.remainingCourses > 0 && (
          <div className="bg-jala-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-jala-blue-900 mb-2">
              Remaining Requirements
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-jala-blue-600">Courses left:</span>
                <span className="ml-2 font-medium">
                  {gpaData.remainingCourses}
                </span>
              </div>
              <div>
                <span className="text-jala-blue-600">Credits left:</span>
                <span className="ml-2 font-medium">
                  {gpaData.remainingCredits}
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default GpaCalculatorPage;
