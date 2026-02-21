"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { getTermsByCohortId } from "@/features/gpa/data/index";
import {
  getTermHonor,
  calculateTermGpa,
} from "@/features/gpa/services/calculator";
import { CohortSelector } from "@/features/config/components/CohortSelector";
import { TermSelector } from "@/features/config/components/TermSelector";
import { ImportExport } from "@/features/config/components/ImportExport";
import { CourseCard } from "@/features/config/components/CourseCard";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";

const MODULE_KEYS = ["Module 1", "Module 2", "Module 3"] as const;

export default function ConfigPage() {
  const t = useTranslations("config");
  const { grades, selectedTermId, selectedCohortId, setGrade } = useGpaStore();
  const [activeModule, setActiveModule] = useState<
    "Module 1" | "Module 2" | "Module 3"
  >("Module 1");

  const terms = getTermsByCohortId(selectedCohortId);
  const selectedTerm =
    terms.find((term) => term.id === selectedTermId) ?? terms[0];
  const termHonor = selectedTerm ? getTermHonor(grades, selectedTerm) : null;
  const termGpa = selectedTerm ? calculateTermGpa(grades, selectedTerm) : 0;

  const handleGradeChange = (courseCode: string, grade: LetterGrade | null) => {
    setGrade(courseCode, grade);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2.5 border-b border-border-base bg-bg-surface/60 shrink-0 gap-3">
        <div className="flex items-center gap-2">
          <CohortSelector />
          <TermSelector />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-border-base">
            {termHonor === "presidents_list" ? (
              <Trophy size={14} className="text-amber-400 shrink-0" />
            ) : termHonor === "deans_list" ? (
              <Medal size={14} className="text-text-accent shrink-0" />
            ) : null}
            <span className="text-sm text-text-muted font-medium">
              {t("term_gpa")}:
            </span>
            <span className="text-lg font-bold tabular-nums text-text-primary">
              {termGpa.toFixed(2)}
            </span>
          </div>
          <ImportExport />
        </div>
      </div>

      <AnimatePresence>
        {termHonor && (
          <motion.div
            key={`honor-${selectedTermId}-${selectedCohortId}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center gap-2 px-4 md:px-6 py-2 border-b shrink-0",
              termHonor === "presidents_list"
                ? "bg-amber-400/8 border-amber-400/20"
                : "bg-jala-700/8 border-jala-400/20",
            )}
          >
            {termHonor === "presidents_list" ? (
              <Trophy
                size={14}
                className="text-amber-500 dark:text-amber-400 shrink-0"
              />
            ) : (
              <Medal size={14} className="text-text-accent shrink-0" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                termHonor === "presidents_list"
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-text-accent",
              )}
            >
              {termHonor === "presidents_list"
                ? t("presidents_list_achieved")
                : t("deans_list_achieved")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCohortId}-${selectedTermId}`}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="hidden md:grid flex-1 grid-cols-3 gap-0 overflow-hidden"
        >
          {MODULE_KEYS.map((moduleKey) => {
            const courses = selectedTerm?.modules[moduleKey] ?? [];
            return (
              <div
                key={moduleKey}
                className="flex flex-col overflow-hidden border-r border-border-base last:border-r-0"
              >
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
                    <div className="flex items-center justify-center h-full text-sm text-text-muted">
                      No courses
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-border-base bg-bg-elevated/60 shrink-0">
          {MODULE_KEYS.map((moduleKey) => (
            <button
              key={moduleKey}
              onClick={() => setActiveModule(moduleKey)}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors duration-200",
                activeModule === moduleKey
                  ? "text-text-accent border-b-2 border-text-accent bg-bg-surface/50"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {t("module")} {moduleKey.split(" ")[1]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCohortId}-${selectedTermId}-${activeModule}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 pb-6"
          >
            {(selectedTerm?.modules[activeModule] ?? []).map((course, i) => (
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
