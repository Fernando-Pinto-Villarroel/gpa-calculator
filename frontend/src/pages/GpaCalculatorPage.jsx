import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Award,
  Medal,
  BookOpen,
  Target,
  TrendingUp,
  Info,
} from "lucide-react";
import { useGpaCalculator } from "../hooks/useGpaCalculator";
import StatsCard from "../components/StatsCard";
import ProgressBar from "../components/ProgressBar";
import RequiredGradeCalculator from "../components/RequiredGradeCalculator";
import InfoSection from "../components/InfoSection";

function GpaCalculatorPage() {
  const { gpaData, honorsLevel } = useGpaCalculator();
  const [showRequiredGrade, setShowRequiredGrade] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getGpaColor = (gpaValue) => {
    if (gpaValue >= 3.9) return "text-yellow-400";
    if (gpaValue >= 3.7) return "text-jala-blue-300";
    if (gpaValue >= 3.5) return "text-green-400";
    if (gpaValue >= 3.0) return "text-space-400";
    if (gpaValue >= 2.0) return "text-orange-400";
    return "text-red-400";
  };

  const getHonorIcon = (level) => {
    switch (level) {
      case "Summa Cum Laude":
        return Trophy;
      case "Magna Cum Laude":
        return Award;
      case "Cum Laude":
        return Medal;
      default:
        return Star;
    }
  };

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
      color: "space",
    },
    {
      title: "Quality Points",
      value: Math.round(gpaData.totalQualityPoints * 10) / 10,
      icon: TrendingUp,
      color: "green",
    },
  ];

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          GPA Calculator
        </h1>
        <p className="text-lg text-cosmic-300">
          Track your academic progress and achievements
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16"
      >
        <div className="inline-block">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-jala-blue-600/20 to-space-600/20 blur-3xl rounded-full" />
            <div className="relative bg-cosmic-900/40 backdrop-blur-xl rounded-3xl p-12 border border-jala-blue-500/30">
              <div className="text-sm font-medium text-cosmic-300 mb-2 uppercase tracking-wide">
                Current GPA
              </div>
              <motion.div
                key={gpaData.gpa}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className={`text-8xl md:text-9xl font-bold ${getGpaColor(
                  gpaData.gpa
                )} mb-4`}
              >
                {gpaData.gpa.toFixed(2)}
              </motion.div>
              <div className="text-lg text-cosmic-400 mb-6">
                out of 4.00 points
              </div>

              {honorsLevel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-center space-x-3"
                >
                  {React.createElement(getHonorIcon(honorsLevel.level), {
                    className: `w-8 h-8 ${honorsLevel.color}`,
                  })}
                  <div className="text-center">
                    <div className={`text-xl font-bold ${honorsLevel.color}`}>
                      {honorsLevel.level}
                    </div>
                    <div className={`text-sm ${honorsLevel.color} opacity-80`}>
                      {honorsLevel.description}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-cosmic-900/40 backdrop-blur-xl rounded-2xl p-8 border border-cosmic-700/50"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Academic Progress
        </h2>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-cosmic-300">
              Course Completion
            </span>
            <span className="text-sm text-cosmic-400">
              {gpaData.completedCourses} / {gpaData.totalCourses}
            </span>
          </div>
          <ProgressBar
            value={gpaData.completionPercentage}
            color="jala-blue"
            animated={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        className="bg-cosmic-900/40 backdrop-blur-xl rounded-2xl p-8 border border-cosmic-700/50"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl font-bold text-white">Grade Planning</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center space-x-2 px-4 py-2 bg-space-600/80 text-white rounded-lg hover:bg-space-500/80 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>Information</span>
            </button>
            <button
              onClick={() => setShowRequiredGrade(!showRequiredGrade)}
              className="flex items-center space-x-2 px-4 py-2 bg-jala-blue-600/80 text-white rounded-lg hover:bg-jala-blue-500/80 transition-colors"
            >
              <Target className="w-5 h-5" />
              <span>Target GPA</span>
            </button>
          </div>
        </div>

        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <InfoSection />
          </motion.div>
        )}

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
          <div className="bg-jala-blue-600/20 backdrop-blur-sm rounded-lg p-6 border border-jala-blue-500/30">
            <h3 className="text-lg font-semibold text-jala-blue-300 mb-4">
              Remaining Requirements
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex justify-between">
                <span className="text-cosmic-300">Courses remaining:</span>
                <span className="font-medium text-white">
                  {gpaData.remainingCourses}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cosmic-300">Credits remaining:</span>
                <span className="font-medium text-white">
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
