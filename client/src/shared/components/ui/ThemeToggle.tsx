"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { cn } from "@/core/lib/utils/cn";

export function ThemeToggle({ onColor = false }: { onColor?: boolean }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-lg",
        "transition-colors duration-200",
        onColor
          ? "border border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/50"
          : "border border-border-base bg-bg-surface text-text-secondary hover:text-text-primary hover:border-border-accent"
      )}
      whileTap={{ scale: 0.92 }}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 30, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon size={16} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -30, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
