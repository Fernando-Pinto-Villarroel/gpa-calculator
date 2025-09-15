import { motion } from "framer-motion";
import { Trophy, Award, Medal, Star } from "lucide-react";

function HonorsDisplay({ honorsLevel }) {
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

  const Icon = getHonorIcon(honorsLevel.level);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
      className={`${honorsLevel.bgColor} ${honorsLevel.borderColor} border-2 rounded-xl shadow-lg p-8`}
    >
      <div className="text-center">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="flex items-center justify-center mb-4"
        >
          <div
            className={`w-16 h-16 rounded-full bg-white ring-4 ring-white ring-opacity-50 flex items-center justify-center shadow-lg`}
          >
            <Icon className={`w-10 h-10 ${honorsLevel.color}`} />
          </div>
        </motion.div>

        <motion.h2
          className={`text-2xl font-bold ${honorsLevel.color} mb-2`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {honorsLevel.level}
        </motion.h2>

        <motion.p
          className={`text-lg ${honorsLevel.color} opacity-80 mb-4`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {honorsLevel.description}
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-600 bg-white bg-opacity-50 rounded-lg p-3"
        >
          Congratulations on your excellent academic performance!
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HonorsDisplay;
