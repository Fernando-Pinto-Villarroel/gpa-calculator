import React from "react";
import { motion } from "framer-motion";

function ProgressBar({ value, color = "jala-blue", animated = false }) {
  const getColorClasses = (colorName) => {
    const colorMap = {
      "jala-blue": "bg-gradient-to-r from-jala-blue-500 to-jala-blue-400",
      space: "bg-gradient-to-r from-space-500 to-space-400",
      green: "bg-gradient-to-r from-green-500 to-green-400",
      yellow: "bg-gradient-to-r from-yellow-500 to-yellow-400",
      red: "bg-gradient-to-r from-red-500 to-red-400",
    };
    return colorMap[colorName] || colorMap["jala-blue"];
  };

  const colorClass = getColorClasses(color);
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full bg-cosmic-800/60 rounded-full h-4 overflow-hidden backdrop-blur-sm">
      <motion.div
        className={`h-full ${colorClass} rounded-full relative ${
          animated ? "animate-pulse" : ""
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {animated && (
          <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
      </motion.div>
    </div>
  );
}

export default ProgressBar;
