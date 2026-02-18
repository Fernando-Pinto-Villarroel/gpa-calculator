import React from "react";
import { motion } from "framer-motion";

function StatsCard({ title, value, total, icon: Icon, color }) {
  const getColorClasses = (colorName) => {
    const colorMap = {
      "jala-blue": {
        bg: "bg-jala-blue-600/20",
        text: "text-jala-blue-400",
        ring: "ring-jala-blue-500/30",
        border: "border-jala-blue-500/30",
      },
      space: {
        bg: "bg-space-600/20",
        text: "text-space-400",
        ring: "ring-space-500/30",
        border: "border-space-500/30",
      },
      green: {
        bg: "bg-green-600/20",
        text: "text-green-400",
        ring: "ring-green-500/30",
        border: "border-green-500/30",
      },
      purple: {
        bg: "bg-purple-600/20",
        text: "text-purple-400",
        ring: "ring-purple-500/30",
        border: "border-purple-500/30",
      },
    };
    return colorMap[colorName] || colorMap["jala-blue"];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div
      className={`bg-cosmic-800/40 backdrop-blur-sm rounded-xl border ${colorClasses.border} p-6 hover:bg-cosmic-800/60 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-cosmic-300 mb-2">{title}</p>
          <div className="flex items-baseline space-x-1">
            <motion.span
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-white"
            >
              {value}
            </motion.span>
            {total !== undefined && (
              <span className="text-lg text-cosmic-400">/ {total}</span>
            )}
          </div>
        </div>

        <div
          className={`w-14 h-14 rounded-xl ${colorClasses.bg} ring-2 ${colorClasses.ring} flex items-center justify-center backdrop-blur-sm`}
        >
          <Icon className={`w-7 h-7 ${colorClasses.text}`} />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
