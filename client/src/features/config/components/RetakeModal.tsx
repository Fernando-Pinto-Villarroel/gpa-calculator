"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, RotateCcw, CheckCircle, Circle, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import { Course } from "@/core/domain/types/course";
import { LetterGrade, ALL_GRADES, letterGradesMap } from "@/core/domain/types/letterGrades";
import {
  CourseGradeEntry,
  CourseAttempt,
  isCourseAttempts,
  isCreditOverrideOnly,
  getEffectiveGrade,
} from "@/core/domain/types/grades";
import { cn } from "@/core/lib/utils/cn";

interface RetakeModalProps {
  isOpen: boolean;
  course: Course;
  entry: CourseGradeEntry;
  onSave: (entry: CourseGradeEntry) => void;
  onClose: () => void;
}

function gradeColor(grade: LetterGrade | null): string {
  if (!grade) return "text-text-muted";
  const pts = letterGradesMap[grade];
  if (pts >= 3.7) return "text-success";
  if (pts >= 3.0) return "text-text-accent";
  if (grade === "F" || grade === "D-") return "text-danger";
  return "text-warning";
}

interface AttemptRowProps {
  attempt: CourseAttempt;
  index: number;
  totalAttempts: number;
  tConfig: ReturnType<typeof useTranslations>;
  onUpdate: (updated: CourseAttempt) => void;
  onRemove: () => void;
}

function AttemptRow({ attempt, index, totalAttempts, tConfig, onUpdate, onRemove }: AttemptRowProps) {
  const [gradeOpen, setGradeOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const gradeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!gradeOpen) return;
    function handleOutside(e: MouseEvent) {
      if (gradeButtonRef.current && !gradeButtonRef.current.contains(e.target as Node)) {
        setGradeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [gradeOpen]);

  const handleGradeToggle = () => {
    if (!gradeOpen && gradeButtonRef.current) {
      const rect = gradeButtonRef.current.getBoundingClientRect();
      setDropdownStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setGradeOpen((v) => !v);
  };

  const handleCreditsChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 4) {
      onUpdate({ ...attempt, credits: num });
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border-base bg-bg-elevated">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text-accent uppercase tracking-wide">
          {tConfig("retake_attempt", { n: index + 1 })}
        </span>
        {totalAttempts > 1 && (
          <button
            onClick={onRemove}
            className="flex items-center gap-1 text-[10px] text-danger hover:text-danger/80 transition-colors"
          >
            <Trash2 size={11} />
            {tConfig("retake_remove_attempt")}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[10px] text-text-muted">{tConfig("retake_credits")}</span>
          <input
            type="number"
            min={1}
            max={4}
            step={1}
            value={attempt.credits}
            onChange={(e) => handleCreditsChange(e.target.value)}
            className={cn(
              "w-full px-2 py-1.5 rounded-md text-xs font-semibold",
              "border border-border-base bg-bg-surface text-text-primary",
              "focus:outline-none focus:border-border-accent",
            )}
          />
        </div>

        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[10px] text-text-muted">{tConfig("retake_grade")}</span>
          <button
            ref={gradeButtonRef}
            onClick={handleGradeToggle}
            className={cn(
              "flex items-center justify-between gap-1 w-full px-2 py-1.5 rounded-md text-xs font-semibold",
              "border border-border-base bg-bg-surface hover:border-border-accent transition-colors",
              gradeColor(attempt.grade),
            )}
          >
            <span>{attempt.grade}</span>
            <span className="text-text-muted text-[10px]">▾</span>
          </button>
          <AnimatePresence>
            {gradeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                style={{ top: dropdownStyle.top, left: dropdownStyle.left, width: dropdownStyle.width }}
                className="fixed rounded-lg border border-border-base bg-bg-surface shadow-xl z-[100] overflow-hidden max-h-44 overflow-y-auto"
              >
                {ALL_GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      onUpdate({ ...attempt, grade: g });
                      setGradeOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 text-xs text-left font-semibold transition-colors",
                      attempt.grade === g ? "bg-jala-700/20" : "hover:bg-bg-elevated",
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

        <div className="flex flex-col gap-0.5 items-center">
          <span className="text-[10px] text-text-muted">{tConfig("retake_approved")}</span>
          <button
            onClick={() => onUpdate({ ...attempt, approved: !attempt.approved })}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
              attempt.approved
                ? "text-success bg-success/10 border border-success/30"
                : "text-text-muted bg-bg-elevated border border-border-base hover:border-border-accent",
            )}
          >
            {attempt.approved ? <CheckCircle size={16} /> : <Circle size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

type ModalView = "asking" | "managing";

export function RetakeModal({ isOpen, course, entry, onSave, onClose }: RetakeModalProps) {
  const tConfig = useTranslations("config");
  const tCourses = useTranslations("courses");

  const [view, setView] = useState<ModalView>("asking");
  const [attempts, setAttempts] = useState<CourseAttempt[]>([]);

  useEffect(() => {
    if (isOpen) {
      const isSingleApproved =
        isCourseAttempts(entry) && entry.length === 1 && entry[0].approved && entry[0].grade !== null;
      if (isCourseAttempts(entry) && entry.length > 0 && !isCreditOverrideOnly(entry) && !isSingleApproved) {
        setView("managing");
        setAttempts([...entry] as CourseAttempt[]);
      } else {
        setView("asking");
        setAttempts([]);
      }
    }
  }, [isOpen, entry]);

  const handleConfirmFailed = () => {
    const existingGrade = typeof entry === "string" ? entry : null;
    const initialCredits = isCourseAttempts(entry) && entry.length > 0
      ? entry[0].credits
      : course.credits;
    const initialAttempt: CourseAttempt = {
      credits: initialCredits,
      grade: existingGrade ?? "F",
      approved: false,
    };
    setAttempts([initialAttempt]);
    setView("managing");
  };

  const handleAddAttempt = () => {
    const last = attempts[attempts.length - 1];
    setAttempts([
      ...attempts,
      {
        credits: last?.credits ?? course.credits,
        grade: "F",
        approved: false,
      },
    ]);
  };

  const handleUpdateAttempt = (index: number, updated: CourseAttempt) => {
    setAttempts(attempts.map((a, i) => {
      if (i === index) return updated;
      if (updated.approved) return { ...a, approved: false };
      return a;
    }));
  };

  const handleRemoveAttempt = (index: number) => {
    setAttempts(attempts.filter((_, i) => i !== index));
  };

  const handleRevert = () => {
    const source = attempts.length > 0 ? attempts : null;
    const grade = getEffectiveGrade(source ?? entry);
    const effectiveAttempt = source?.find((a) => a.approved && a.grade !== null)
      ?? source?.[source.length - 1];
    const credits = effectiveAttempt?.credits ?? course.credits;

    if (grade && credits !== course.credits) {
      onSave([{ credits, grade, approved: true }]);
    } else {
      onSave(grade);
    }
  };

  const handleSave = () => {
    if (attempts.length === 0) {
      onSave(null);
    } else {
      onSave(attempts);
    }
  };

  if (!isOpen) return null;

  const courseName = tCourses(course.courseCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md rounded-2xl border border-border-base bg-bg-surface shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-border-base">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-muted font-mono">{course.courseCode}</p>
            <p className="text-sm font-semibold text-text-primary leading-tight mt-0.5 line-clamp-2">
              {courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 shrink-0 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          {view === "asking" ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-text-secondary">
                {tConfig("failed_course_question")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmFailed}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-danger/10 text-danger border border-danger/30 hover:bg-danger/15 transition-colors"
                >
                  {tConfig("failed_course_confirm")}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border-base text-text-secondary hover:bg-bg-elevated transition-colors"
                >
                  {tConfig("failed_course_cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {attempts.length === 1 && attempts[0].approved && (
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-success/30 bg-success/8">
                  <Lightbulb size={14} className="text-success shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-success leading-snug">
                      {tConfig("retake_suggest_revert")}
                    </p>
                    <button
                      onClick={handleRevert}
                      className="mt-1.5 text-[11px] font-semibold text-success underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      {tConfig("retake_revert")}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {attempts.map((attempt, i) => (
                  <AttemptRow
                    key={i}
                    attempt={attempt}
                    index={i}
                    totalAttempts={attempts.length}
                    tConfig={tConfig}
                    onUpdate={(updated) => handleUpdateAttempt(i, updated)}
                    onRemove={() => handleRemoveAttempt(i)}
                  />
                ))}
              </div>

              <button
                onClick={handleAddAttempt}
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border border-dashed border-border-strong text-text-secondary hover:text-text-primary hover:border-border-accent transition-colors"
              >
                <Plus size={13} />
                {tConfig("retake_add_attempt")}
              </button>

              <button
                onClick={handleRevert}
                className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <RotateCcw size={12} />
                {tConfig("retake_revert")}
              </button>
            </div>
          )}
        </div>

        {view === "managing" && (
          <div className="flex items-center gap-2 px-5 py-3 border-t border-border-base bg-bg-elevated/60">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-semibold border border-border-base text-text-secondary hover:bg-bg-elevated transition-colors"
            >
              {tConfig("retake_close")}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-jala-700 text-white hover:bg-jala-600 transition-colors"
            >
              {tConfig("retake_save")}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
