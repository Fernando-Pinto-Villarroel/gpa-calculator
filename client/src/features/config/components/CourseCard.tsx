"use client";

import { Course } from "@/core/domain/types/course";
import { LetterGrade, letterGradesMap } from "@/core/domain/types/letterGrades";
import { GradeSelector } from "./GradeSelector";
import { cn } from "@/core/lib/utils/cn";
import { useTranslations } from "next-intl";

interface CourseCardProps {
  course: Course;
  grade: LetterGrade | null;
  onChange: (courseCode: string, grade: LetterGrade | null) => void;
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

export function CourseCard({ course, grade, onChange }: CourseCardProps) {
  const t = useTranslations("config");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border bg-bg-surface",
        "border-border-base hover:border-border-strong transition-colors duration-200"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-primary leading-tight line-clamp-2">
            {course.name}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5 font-mono">
            {course.courseCode}
          </p>
        </div>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0", creditsBadgeClass(course.credits))}>
          {course.credits} {t("credits_label")}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-300", gradeBarColor(grade))}
            style={{ width: gradeBarWidth(grade) }}
          />
        </div>
        <div className="w-20 shrink-0">
          <GradeSelector
            courseCode={course.courseCode}
            grade={grade}
            onChange={onChange}
            noGradeLabel={t("no_grade")}
          />
        </div>
      </div>
    </div>
  );
}
