"use client";

import { useState, useRef, useEffect } from "react";
import { Course } from "@/core/domain/types/course";
import { LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import {
  CourseGradeEntry,
  CourseAttempt,
  isCourseAttempts,
  isCreditOverrideOnly,
  getEffectiveGrade,
  isCourseApproved,
} from "@/core/domain/types/grades";
import { GradeSelector } from "./GradeSelector";
import { RetakeModal } from "./RetakeModal";
import { cn } from "@/core/lib/utils/cn";
import { useTranslations } from "next-intl";
import { TriangleAlert, CheckCircle, Info } from "lucide-react";

interface CourseCardTourIds {
  card?: string;
  credits?: string;
  retakeBtn?: string;
}

interface CourseCardProps {
  course: Course;
  entry: CourseGradeEntry;
  onChange: (courseCode: string, entry: CourseGradeEntry) => void;
  tourIds?: CourseCardTourIds;
}

function creditsBadgeClass(credits: number): string {
  if (credits >= 4) return "text-jala-400 bg-jala-700/10";
  if (credits >= 3) return "text-text-accent bg-jala-700/10";
  return "text-text-muted bg-bg-elevated";
}

function gradeBarWidth(grade: LetterGrade | null): string {
  if (!grade) return "0%";
  return `${(letterGradesMap[grade] / 4.0) * 100}%`;
}

function gradeBarColor(grade: LetterGrade | null): string {
  if (!grade) return "bg-border-strong";
  const pts = letterGradesMap[grade];
  if (pts >= 3.7) return "bg-success";
  if (pts >= 3.0) return "bg-jala-500";
  if (pts >= 2.0) return "bg-warning";
  return "bg-danger";
}

function isSingleApprovedAttempt(
  entry: CourseGradeEntry,
): entry is [CourseAttempt] {
  return (
    isCourseAttempts(entry) &&
    entry.length === 1 &&
    entry[0].approved &&
    entry[0].grade !== null
  );
}

export function CourseCard({
  course,
  entry,
  onChange,
  tourIds,
}: CourseCardProps) {
  const t = useTranslations("config");
  const tCourses = useTranslations("courses");
  const [retakeModalOpen, setRetakeModalOpen] = useState(false);
  const [editingCredits, setEditingCredits] = useState(false);
  const [creditInput, setCreditInput] = useState("");
  const creditInputRef = useRef<HTMLInputElement>(null);

  const creditOverride = isCreditOverrideOnly(entry);
  const singleApproved = isSingleApprovedAttempt(entry);
  const isFullRetake =
    isCourseAttempts(entry) && !singleApproved && !creditOverride;

  const effectiveGrade = getEffectiveGrade(entry);
  const approved = isCourseApproved(entry);
  const attemptCount = isFullRetake ? (entry as CourseAttempt[]).length : 0;

  const displayCredits =
    singleApproved || creditOverride
      ? (entry as CourseAttempt[])[0].credits
      : course.credits;
  const creditsOverridden =
    (singleApproved || creditOverride) &&
    (entry as CourseAttempt[])[0].credits !== course.credits;

  useEffect(() => {
    if (editingCredits && creditInputRef.current) {
      creditInputRef.current.focus();
      creditInputRef.current.select();
    }
  }, [editingCredits]);

  const startEditingCredits = () => {
    if (isFullRetake) return;
    setCreditInput(String(displayCredits));
    setEditingCredits(true);
  };

  const saveCredits = () => {
    const num = parseInt(creditInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 4) {
      if (effectiveGrade) {
        if (num === course.credits) {
          onChange(course.courseCode, effectiveGrade);
        } else {
          onChange(course.courseCode, [
            { credits: num, grade: effectiveGrade, approved: true },
          ]);
        }
      } else {
        if (num === course.credits) {
          onChange(course.courseCode, null);
        } else {
          onChange(course.courseCode, [
            { credits: num, grade: null, approved: false },
          ]);
        }
      }
    }
    setEditingCredits(false);
  };

  const handleSimpleGradeChange = (
    courseCode: string,
    grade: LetterGrade | null,
  ) => {
    if (grade === null) {
      if (singleApproved && creditsOverridden) {
        onChange(courseCode, [
          {
            credits: (entry as CourseAttempt[])[0].credits,
            grade: null,
            approved: false,
          },
        ]);
      } else {
        onChange(courseCode, null);
      }
      return;
    }

    const overrideCredits =
      singleApproved || creditOverride
        ? (entry as CourseAttempt[])[0].credits
        : null;

    if (overrideCredits !== null && overrideCredits !== course.credits) {
      if (grade === "F" || grade === "D-") {
        setRetakeModalOpen(true);
      } else {
        onChange(courseCode, [
          { credits: overrideCredits, grade, approved: true },
        ]);
      }
    } else {
      onChange(courseCode, grade);
      if (grade === "F" || grade === "D-") {
        setRetakeModalOpen(true);
      }
    }
  };

  const handleRetakeSave = (newEntry: CourseGradeEntry) => {
    onChange(course.courseCode, newEntry);
    setRetakeModalOpen(false);
  };

  const currentGradeForSelector = singleApproved
    ? (entry as CourseAttempt[])[0].grade
    : typeof entry === "string"
      ? entry
      : null;

  return (
    <>
      <div
        data-tour={tourIds?.card}
        className={cn(
          "flex flex-col gap-2 p-3 rounded-xl border bg-bg-surface",
          "border-border-base hover:border-border-strong transition-colors duration-200",
          isFullRetake && !approved && "border-warning/40 bg-warning/5",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-primary leading-tight line-clamp-2">
              {tCourses(course.courseCode)}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5 font-mono">
              {course.courseCode}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              data-tour={tourIds?.retakeBtn}
              onClick={() => setRetakeModalOpen(true)}
              title={t("failed_course_button_title")}
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded transition-colors",
                isFullRetake
                  ? "text-warning hover:text-warning/80"
                  : "text-text-muted/50 hover:text-warning",
              )}
            >
              <TriangleAlert size={12} />
            </button>

            {editingCredits ? (
              <div className="flex items-center gap-1">
                <input
                  ref={creditInputRef}
                  type="number"
                  min={1}
                  max={4}
                  step={1}
                  value={creditInput}
                  onChange={(e) => setCreditInput(e.target.value)}
                  onBlur={saveCredits}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveCredits();
                    if (e.key === "Escape") setEditingCredits(false);
                  }}
                  className={cn(
                    "w-8 text-center text-[10px] font-semibold px-1 py-0.5 rounded",
                    "border border-border-accent bg-bg-surface text-text-primary focus:outline-none",
                  )}
                />
                <span className="text-[10px] text-text-muted">
                  {t("credits_label")}
                </span>
              </div>
            ) : (
              <span
                data-tour={tourIds?.credits}
                onDoubleClick={!isFullRetake ? startEditingCredits : undefined}
                title={
                  !isFullRetake ? t("credits_double_click_hint") : undefined
                }
                className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  creditsBadgeClass(displayCredits),
                  creditsOverridden && "ring-1 ring-warning/60",
                  !isFullRetake && "cursor-pointer select-none",
                )}
              >
                {displayCredits} {t("credits_label")}
                {creditsOverridden && " *"}
              </span>
            )}
          </div>
        </div>

        {editingCredits && (
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg border border-warning/25 bg-warning/8">
            <Info size={11} className="text-warning shrink-0 mt-0.5" />
            <p className="text-[10px] text-warning leading-snug">
              {t("credits_override_warning")}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                gradeBarColor(effectiveGrade),
              )}
              style={{ width: gradeBarWidth(effectiveGrade) }}
            />
          </div>

          {isFullRetake ? (
            <button
              onClick={() => setRetakeModalOpen(true)}
              className={cn(
                "w-20 shrink-0 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold",
                "border border-border-base bg-bg-elevated hover:border-border-accent transition-colors",
                approved ? "text-success" : "text-warning",
              )}
            >
              {approved ? (
                <>
                  <CheckCircle size={11} />
                  <span className="truncate">{effectiveGrade}</span>
                </>
              ) : (
                <>
                  <TriangleAlert size={11} />
                  <span className="truncate">
                    {attemptCount} {t("retake_attempts_count")}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="w-20 shrink-0">
              <GradeSelector
                courseCode={course.courseCode}
                grade={currentGradeForSelector}
                onChange={handleSimpleGradeChange}
                noGradeLabel={t("no_grade")}
              />
            </div>
          )}
        </div>
      </div>

      <RetakeModal
        isOpen={retakeModalOpen}
        course={course}
        entry={entry}
        onSave={handleRetakeSave}
        onClose={() => setRetakeModalOpen(false)}
      />
    </>
  );
}
