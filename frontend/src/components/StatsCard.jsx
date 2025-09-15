import { motion } from "framer-motion";

function StatsCard({ title, value, total, icon: Icon, color }) {
  const getColorClasses = (colorName) => {
    const colorMap = {
      "jala-blue": {
        bg: "bg-jala-blue-50",
        text: "text-jala-blue-600",
        ring: "ring-jala-blue-200",
      },
      "jala-cyan": {
        bg: "bg-jala-cyan-50",
        text: "text-jala-cyan-600",
        ring: "ring-jala-cyan-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-600",
        ring: "ring-green-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-600",
        ring: "ring-purple-200",
      },
    };
    return colorMap[colorName] || colorMap["jala-blue"];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <motion.span
              key={value}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-gray-900"
            >
              {value}
            </motion.span>
            {total !== undefined && (
              <span className="text-lg text-gray-500">/ {total}</span>
            )}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-lg ${colorClasses.bg} ring-2 ${colorClasses.ring} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colorClasses.text}`} />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
