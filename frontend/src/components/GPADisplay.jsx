import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function GPADisplay({ gpa }) {
  const getGpaColor = (gpaValue) => {
    if (gpaValue >= 3.9) return "text-yellow-600";
    if (gpaValue >= 3.7) return "text-blue-600";
    if (gpaValue >= 3.5) return "text-green-600";
    if (gpaValue >= 3.0) return "text-indigo-600";
    if (gpaValue >= 2.0) return "text-orange-600";
    return "text-red-600";
  };

  const getGpaBgColor = (gpaValue) => {
    if (gpaValue >= 3.9)
      return "bg-gradient-to-br from-yellow-50 to-yellow-100";
    if (gpaValue >= 3.7) return "bg-gradient-to-br from-blue-50 to-blue-100";
    if (gpaValue >= 3.5) return "bg-gradient-to-br from-green-50 to-green-100";
    if (gpaValue >= 3.0)
      return "bg-gradient-to-br from-indigo-50 to-indigo-100";
    if (gpaValue >= 2.0)
      return "bg-gradient-to-br from-orange-50 to-orange-100";
    return "bg-gradient-to-br from-red-50 to-red-100";
  };

  const getGpaRing = (gpaValue) => {
    if (gpaValue >= 3.9) return "ring-yellow-200";
    if (gpaValue >= 3.7) return "ring-blue-200";
    if (gpaValue >= 3.5) return "ring-green-200";
    if (gpaValue >= 3.0) return "ring-indigo-200";
    if (gpaValue >= 2.0) return "ring-orange-200";
    return "ring-red-200";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full ${getGpaBgColor(
              gpa
            )} ring-4 ${getGpaRing(gpa)} flex items-center justify-center`}
          >
            <TrendingUp className={`w-8 h-8 ${getGpaColor(gpa)}`} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Current GPA</h2>

        <motion.div
          key={gpa}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className={`text-6xl font-bold ${getGpaColor(gpa)} mb-4`}
        >
          {gpa.toFixed(2)}
        </motion.div>

        <div className="text-lg text-gray-600">out of 4.00</div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-semibold text-gray-900">Grade Scale</div>
              <div>A = 4.0, B = 3.0, C = 2.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPADisplay;
