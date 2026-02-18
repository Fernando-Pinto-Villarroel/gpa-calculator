import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen, Star } from "lucide-react";

function InfoSection() {
  const gradeScale = [
    { grade: "A", points: "4.0", description: "Excellent" },
    { grade: "A-", points: "3.7", description: "Very Good High" },
    { grade: "B+", points: "3.3", description: "Very Good" },
    { grade: "B", points: "3.0", description: "Good" },
    { grade: "B-", points: "2.7", description: "Good Low" },
    { grade: "C+", points: "2.3", description: "Fair High" },
    { grade: "C", points: "2.0", description: "Fair" },
    { grade: "C-", points: "1.7", description: "Fair Low" },
    { grade: "D+", points: "1.3", description: "Poor High" },
    { grade: "D", points: "1.0", description: "Poor" },
    { grade: "D-", points: "0.7", description: "Poor Low" },
    { grade: "F", points: "0.0", description: "Failing" },
  ];

  const honorsLevels = [
    {
      title: "Summa Cum Laude",
      gpa: "3.90 - 4.00",
      description: "Highest Honors",
      icon: Award,
      color: "text-yellow-400",
    },
    {
      title: "Magna Cum Laude",
      gpa: "3.70 - 3.89",
      description: "High Honors",
      icon: Star,
      color: "text-jala-blue-400",
    },
    {
      title: "Cum Laude",
      gpa: "3.50 - 3.69",
      description: "With Honors",
      icon: GraduationCap,
      color: "text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-cosmic-800/40 backdrop-blur-sm rounded-xl p-6 border border-cosmic-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-6 h-6 text-jala-blue-400" />
            <h3 className="text-xl font-bold text-white">
              American Grading System
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-cosmic-300 text-sm leading-relaxed">
              The GPA (Grade Point Average) system is the standard in American
              universities. Each letter grade has a numerical value that is
              multiplied by the course credits.
            </p>

            <div className="space-y-2">
              <h4 className="font-semibold text-jala-blue-300 mb-3">
                Grading Scale:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {gradeScale.map((item) => (
                  <div
                    key={item.grade}
                    className="flex justify-between items-center p-2 bg-cosmic-900/40 rounded"
                  >
                    <span className="font-mono text-white">{item.grade}</span>
                    <span className="text-cosmic-300">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cosmic-800/40 backdrop-blur-sm rounded-xl p-6 border border-cosmic-700/50">
          <h4 className="font-semibold text-jala-blue-300 mb-3">
            Importance of Credits
          </h4>
          <div className="space-y-3 text-sm text-cosmic-300">
            <p>
              <strong className="text-white">Academic credits</strong> represent
              the time dedicated to each subject. A 3-credit course typically
              requires 3 hours of class per week.
            </p>
            <p>
              GPA is calculated by multiplying each grade by its credits, adding
              everything up, and dividing by the total attempted credits.
            </p>
            <div className="bg-jala-blue-600/20 rounded-lg p-3 border border-jala-blue-500/30">
              <p className="text-jala-blue-300 text-xs font-mono">
                GPA = Σ(Points × Credits) / Σ(Credits)
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="bg-cosmic-800/40 backdrop-blur-sm rounded-xl p-6 border border-cosmic-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Honors Recognition</h3>
          </div>

          <div className="space-y-4">
            <p className="text-cosmic-300 text-sm leading-relaxed">
              Latin honors recognize academic excellence. These distinctions
              appear on your diploma and official transcript.
            </p>

            <div className="space-y-4">
              {honorsLevels.map((honor, index) => (
                <motion.div
                  key={honor.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-cosmic-900/40 rounded-lg border border-cosmic-700/30"
                >
                  <div className="w-12 h-12 rounded-full bg-cosmic-800/50 flex items-center justify-center">
                    <honor.icon className={`w-6 h-6 ${honor.color}`} />
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-semibold ${honor.color}`}>
                      {honor.title}
                    </h5>
                    <p className="text-xs text-cosmic-400">
                      {honor.description}
                    </p>
                    <p className="text-xs font-mono text-white mt-1">
                      GPA: {honor.gpa}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-cosmic-800/40 backdrop-blur-sm rounded-xl p-6 border border-cosmic-700/50">
          <h4 className="font-semibold text-jala-blue-300 mb-3">
            Important Tips
          </h4>
          <div className="space-y-2 text-sm text-cosmic-300">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-jala-blue-400 mt-2 flex-shrink-0"></div>
              <p>Maintain a consistent GPA throughout your career</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-jala-blue-400 mt-2 flex-shrink-0"></div>
              <p>Courses with more credits have greater impact on your GPA</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-jala-blue-400 mt-2 flex-shrink-0"></div>
              <p>Plan your courses to achieve your honor goals</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-jala-blue-400 mt-2 flex-shrink-0"></div>
              <p>
                High GPA opens opportunities for scholarships and graduate
                school
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default InfoSection;
