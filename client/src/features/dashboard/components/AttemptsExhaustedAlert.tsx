"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

interface AttemptsExhaustedAlertProps {
  title: string;
  text: string;
}

export function AttemptsExhaustedAlert({ title, text }: AttemptsExhaustedAlertProps) {
  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.35 }}
      className="flex items-start gap-3 max-w-md px-4 py-3 rounded-2xl border border-danger/40 bg-danger/10 text-danger"
    >
      <XCircle size={18} className="shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm opacity-80 mt-0.5">{text}</p>
      </div>
    </motion.div>
  );
}
