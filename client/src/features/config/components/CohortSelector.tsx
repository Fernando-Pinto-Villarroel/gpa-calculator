"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cohorts } from "@/features/gpa/data/index";
import { cn } from "@/core/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";

export function CohortSelector() {
  const t = useTranslations("config");
  const { selectedCohortId, setSelectedCohortId } = useGpaStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCohort =
    cohorts.find((c) => c.id === selectedCohortId) ??
    cohorts[cohorts.length - 1];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium",
          "border border-border-base bg-bg-surface",
          "text-text-primary hover:border-border-accent",
          "transition-colors duration-200 min-w-[140px] sm:min-w-44",
        )}
      >
        <GraduationCap size={14} className="text-text-accent shrink-0" />
        <span className="flex-1 text-left truncate">
          {selectedCohort.label}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-muted transition-transform shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute left-0 top-11 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-52",
            )}
          >
            {cohorts.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => {
                  setSelectedCohortId(cohort.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left transition-colors",
                  cohort.id === selectedCohortId
                    ? "bg-jala-700/15 text-text-accent font-medium"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                )}
              >
                {cohort.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
