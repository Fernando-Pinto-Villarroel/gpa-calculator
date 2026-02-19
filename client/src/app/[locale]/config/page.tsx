"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { terms } from "@/features/gpa/data/courseData";
import { TermSelector } from "@/features/config/components/TermSelector";
import { ImportExport } from "@/features/config/components/ImportExport";
import { CourseCard } from "@/features/config/components/CourseCard";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";

const MODULE_KEYS = ["Module 1", "Module 2", "Module 3"] as const;

export default function ConfigPage() {
  const t = useTranslations("config");
  const { grades, selectedTermId, setGrade } = useGpaStore();
  const [activeModule, setActiveModule] = useState<"Module 1" | "Module 2" | "Module 3">("Module 1");

  const selectedTerm = terms.find((term) => term.id === selectedTermId) ?? terms[0];

  const handleGradeChange = (courseCode: string, grade: LetterGrade | null) => {
    setGrade(courseCode, grade);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 border-b border-border-base bg-bg-surface/60 shrink-0 gap-3">
        <TermSelector />
        <ImportExport />
      </div>

      {/* ── Desktop: 3-column grid ─────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTermId}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="hidden md:grid flex-1 grid-cols-3 gap-0 overflow-hidden"
        >
          {MODULE_KEYS.map((moduleKey) => {
            const courses = selectedTerm.modules[moduleKey] ?? [];
            return (
              <div key={moduleKey} className="flex flex-col overflow-hidden border-r border-border-base last:border-r-0">
                <div className="px-4 py-2.5 border-b border-border-base bg-bg-elevated/60 shrink-0">
                  <p className="text-xs font-semibold text-text-accent uppercase tracking-wider">
                    {t("module")} {moduleKey.split(" ")[1]}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {courses.map((course, i) => (
                    <motion.div
                      key={course.courseCode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                    >
                      <CourseCard
                        course={course}
                        grade={grades[course.courseCode] ?? null}
                        onChange={handleGradeChange}
                      />
                    </motion.div>
                  ))}
                  {courses.length === 0 && (
                    <div className="flex items-center justify-center h-full text-sm text-text-muted">No courses</div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Mobile: tabs per module ────────────────── */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Module tabs */}
        <div className="flex border-b border-border-base bg-bg-elevated/60 shrink-0">
          {MODULE_KEYS.map((moduleKey) => (
            <button
              key={moduleKey}
              onClick={() => setActiveModule(moduleKey)}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors duration-200",
                activeModule === moduleKey
                  ? "text-text-accent border-b-2 border-text-accent bg-bg-surface/50"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {t("module")} {moduleKey.split(" ")[1]}
            </button>
          ))}
        </div>

        {/* Module courses */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedTermId}-${activeModule}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 pb-6"
          >
            {(selectedTerm.modules[activeModule] ?? []).map((course, i) => (
              <motion.div
                key={course.courseCode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <CourseCard
                  course={course}
                  grade={grades[course.courseCode] ?? null}
                  onChange={handleGradeChange}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
