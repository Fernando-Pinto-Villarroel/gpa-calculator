"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { calculateGpa, getTermHonor } from "@/features/gpa/services/calculator";
import { EspCohortSelector } from "./EspCohortSelector";
import { EspActionsMenu } from "./EspActionsMenu";
import { CourseCard } from "@/features/config/components/CourseCard";
import { CourseGradeEntry } from "@/core/domain/types/grades";
import { cn } from "@/core/lib/utils/cn";

export function EspGradesView() {
  const t = useTranslations("config");
  const { grades, selectedCohortId, setGradeEntry } = useEspGpaStore();
  const [activeLevel, setActiveLevel] = useState(0);

  const terms = getEspTermsByCohortId(selectedCohortId);
  const overallGpa = calculateGpa(grades, terms).gpa;

  const handleGradeChange = (courseCode: string, entry: CourseGradeEntry) => {
    setGradeEntry(courseCode, entry);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        data-tour="config-toolbar"
        className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-2.5 border-b border-border-base bg-bg-surface/60 shrink-0 gap-3"
      >

        <div className="flex items-center gap-2">
          <EspCohortSelector />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated/60 border border-border-base flex-1 md:flex-none justify-center">
            <span className="text-sm text-text-muted font-medium">
              {t("esp_gpa_label")}:
            </span>
            <span className="text-lg font-bold tabular-nums text-text-primary">
              {overallGpa.toFixed(2)}
            </span>
          </div>
          <EspActionsMenu />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCohortId}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2 }}
          className="hidden md:grid flex-1 grid-cols-3 gap-0 overflow-hidden"
        >
          {terms.map((term, termIndex) => {
            const moduleName = Object.keys(term.modules)[0];
            const courses = term.modules[moduleName] ?? [];
            const honor = getTermHonor(grades, term);
            return (
              <div
                key={term.id}
                className="flex flex-col overflow-hidden border-r border-border-base last:border-r-0"
              >
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border-base bg-bg-elevated/60 shrink-0">
                  <p className="text-xs font-semibold text-text-accent uppercase tracking-wider">
                    {t("level")} {term.ordinal}
                  </p>
                  {honor === "presidents_list" ? (
                    <Trophy size={13} className="text-amber-400 shrink-0" />
                  ) : honor === "deans_list" ? (
                    <Medal size={13} className="text-text-accent shrink-0" />
                  ) : null}
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
                        entry={grades[course.courseCode] ?? null}
                        onChange={handleGradeChange}
                        tourIds={
                          termIndex === 0 && i === 0
                            ? {
                                card: "first-course-card",
                                credits: "first-credits-badge",
                                retakeBtn: "first-retake-btn",
                              }
                            : undefined
                        }
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-border-base bg-bg-elevated/60 shrink-0">
          {terms.map((term, index) => (
            <button
              key={term.id}
              onClick={() => setActiveLevel(index)}
              className={cn(
                "flex-1 py-2.5 text-xs font-semibold transition-colors duration-200",
                activeLevel === index
                  ? "text-text-accent border-b-2 border-text-accent bg-bg-surface/50"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {t("level")} {term.ordinal}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCohortId}-${activeLevel}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 pb-6"
          >
            {(() => {
              const term = terms[activeLevel];
              if (!term) return null;
              const moduleName = Object.keys(term.modules)[0];
              const courses = term.modules[moduleName] ?? [];
              return courses.map((course, i) => (
                <motion.div
                  key={course.courseCode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  <CourseCard
                    course={course}
                    entry={grades[course.courseCode] ?? null}
                    onChange={handleGradeChange}
                    tourIds={
                      activeLevel === 0 && i === 0
                        ? {
                            card: "first-course-card-m",
                            credits: "first-credits-badge-m",
                            retakeBtn: "first-retake-btn-m",
                          }
                        : undefined
                    }
                  />
                </motion.div>
              ));
            })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
