"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LetterGrade,
  ALL_GRADES,
  letterGradesMap,
} from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";

interface GradeSelectorProps {
  courseCode: string;
  grade: LetterGrade | null;
  onChange: (courseCode: string, grade: LetterGrade | null) => void;
  noGradeLabel: string;
}

function gradeColor(grade: LetterGrade | null): string {
  if (!grade) return "text-text-muted";
  const pts = letterGradesMap[grade];
  const isExcellent = pts >= 3.7;
  const isGood = pts >= 3.0 && !isExcellent;
  const isFailing = grade === "F" || grade === "D-";

  if (isExcellent) return "text-success";
  if (isGood) return "text-text-accent";
  if (isFailing) return "text-danger";
  return "text-warning";
}

export function GradeSelector({
  courseCode,
  grade,
  onChange,
  noGradeLabel,
}: GradeSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (g: LetterGrade | null) => {
    onChange(courseCode, g);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-between gap-1 w-full px-2.5 py-1.5 rounded-md text-xs font-semibold",
          "border border-border-base bg-bg-elevated hover:border-border-accent",
          "transition-colors duration-150",
          gradeColor(grade),
        )}
      >
        <span>{grade ?? noGradeLabel}</span>
        <ChevronDown
          size={12}
          className={cn(
            "text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute left-0 top-full mt-1 w-24 rounded-lg border border-border-base bg-bg-surface shadow-xl z-20",
              "overflow-hidden max-h-48 overflow-y-auto",
            )}
          >
            <button
              onClick={() => select(null)}
              className={cn(
                "w-full px-3 py-1.5 text-xs text-left font-medium transition-colors",
                !grade
                  ? "bg-border-base text-text-muted"
                  : "text-text-muted hover:bg-bg-elevated",
              )}
            >
              {noGradeLabel}
            </button>
            {ALL_GRADES.map((g) => (
              <button
                key={g}
                onClick={() => select(g)}
                className={cn(
                  "w-full px-3 py-1.5 text-xs text-left font-semibold transition-colors",
                  grade === g ? "bg-jala-700/20" : "hover:bg-bg-elevated",
                  gradeColor(g),
                )}
              >
                {g}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
