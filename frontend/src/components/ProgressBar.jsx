import { motion } from "framer-motion";

function ProgressBar({ value, color = "jala-blue", animated = false }) {
  const getColorClasses = (colorName) => {
    const colorMap = {
      "jala-blue": "bg-jala-blue-500",
      "jala-cyan": "bg-jala-cyan-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    };
    return colorMap[colorName] || colorMap["jala-blue"];
  };

  const colorClass = getColorClasses(color);
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <motion.div
        className={`h-full ${colorClass} rounded-full relative ${
          animated ? "animate-pulse" : ""
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {animated && (
          <div className="absolute inset-0 bg-white opacity-20 animate-ping rounded-full" />
        )}
      </motion.div>
    </div>
  );
}

export default ProgressBar;
