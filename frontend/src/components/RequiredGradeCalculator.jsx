import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { useGpaCalculator } from "@hooks/useGpaCalculator";

function RequiredGradeCalculator() {
  const [targetGPA, setTargetGPA] = useState(3.5);
  const { calculateRequiredGrade } = useGpaCalculator();

  const requiredGrade = calculateRequiredGrade(targetGPA);

  const getGradeRecommendation = (grade) => {
    if (grade === null) return null;
    if (grade > 4.0)
      return { text: "Impossible", color: "text-red-600", icon: AlertTriangle };
    if (grade >= 3.7)
      return {
        text: "A- or better",
        color: "text-green-600",
        icon: CheckCircle,
      };
    if (grade >= 3.3)
      return {
        text: "B+ or better",
        color: "text-blue-600",
        icon: CheckCircle,
      };
    if (grade >= 3.0)
      return {
        text: "B or better",
        color: "text-indigo-600",
        icon: CheckCircle,
      };
    if (grade >= 2.7)
      return {
        text: "B- or better",
        color: "text-yellow-600",
        icon: CheckCircle,
      };
    return { text: "C or better", color: "text-orange-600", icon: CheckCircle };
  };

  const recommendation = getGradeRecommendation(requiredGrade);

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Calculator className="w-6 h-6 text-jala-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Target GPA Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target GPA
          </label>
          <input
            type="number"
            min="0"
            max="4"
            step="0.01"
            value={targetGPA}
            onChange={(e) => setTargetGPA(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jala-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your desired GPA (0.00 - 4.00)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Average Grade
          </label>
          <div className="flex items-center space-x-3">
            {requiredGrade !== null ? (
              <>
                <motion.div
                  key={requiredGrade}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-gray-900"
                >
                  {requiredGrade.toFixed(2)}
                </motion.div>
                {recommendation && (
                  <div className="flex items-center space-x-2">
                    <recommendation.icon
                      className={`w-5 h-5 ${recommendation.color}`}
                    />
                    <span className={`font-medium ${recommendation.color}`}>
                      {recommendation.text}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500">No remaining courses</div>
            )}
          </div>

          {requiredGrade !== null && (
            <p className="text-xs text-gray-500 mt-1">
              Average grade needed in remaining courses
            </p>
          )}
        </div>
      </div>

      {requiredGrade > 4.0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Target GPA not achievable with remaining courses
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            Consider setting a lower target GPA or improving grades in completed
            courses if possible.
          </p>
        </motion.div>
      )}

      {requiredGrade <= 4.0 && requiredGrade > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Focus on maintaining consistent grades in your
            remaining courses to achieve your target GPA of{" "}
            {targetGPA.toFixed(2)}.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default RequiredGradeCalculator;
