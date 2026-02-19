"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Star, AlertTriangle, CreditCard, BookMarked, Timer } from "lucide-react";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import {
  calculateGpa,
  getHonorStatus,
  getBestAndWorstCourses,
  getCompletedTermsCount,
} from "@/features/gpa/services/calculator";
import { letterGradesMap } from "@/core/domain/types/letterGrades";
import { getTotalCredits } from "@/features/gpa/data/courseData";
import { GpaDisplay } from "@/features/dashboard/components/GpaDisplay";
import { HonorBadge } from "@/features/dashboard/components/HonorBadge";
import { StatCard } from "@/features/dashboard/components/StatCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const grades = useGpaStore((s) => s.grades);

  const { gpa, completedCourses, completedCredits, remainingCredits } = calculateGpa(grades);
  const honorStatus = getHonorStatus(gpa);
  const { best, worst } = getBestAndWorstCourses(grades);
  const termsCompleted = getCompletedTermsCount(grades);
  const totalCredits = getTotalCredits();

  const isAtRisk = honorStatus === "at_risk" || honorStatus === "academic_failure";

  const leftStats = [
    {
      label: t("stats.completed_subjects"),
      value: String(completedCourses),
      icon: BookOpen,
      tooltip: `${completedCourses} courses with grades entered`,
    },
    {
      label: t("stats.best_subject"),
      value: best ? `${best.grade}` : "—",
      subvalue: best ? best.name : undefined,
      icon: Star,
      variant: best && letterGradesMap[best.grade!] >= 3.7 ? ("success" as const) : ("default" as const),
      tooltip: best ? `${best.name} — ${best.termLabel}` : undefined,
    },
    {
      label: t("stats.terms_completed"),
      value: String(termsCompleted),
      subvalue: `${tc("of")} 8`,
      icon: Timer,
    },
  ];

  const rightStats = [
    {
      label: t("stats.worst_subject"),
      value: worst ? `${worst.grade}` : "—",
      subvalue: worst ? worst.name : undefined,
      icon: AlertTriangle,
      variant:
        worst && letterGradesMap[worst.grade!] < 2.0
          ? ("danger" as const)
          : worst && letterGradesMap[worst.grade!] < 3.0
            ? ("warning" as const)
            : ("default" as const),
      tooltip: worst ? `${worst.name} — ${worst.termLabel}` : undefined,
    },
    {
      label: t("stats.earned_credits"),
      value: String(completedCredits),
      subvalue: `${tc("of")} ${totalCredits}`,
      icon: CreditCard,
      variant: "success" as const,
    },
    {
      label: t("stats.remaining_credits"),
      value: String(remainingCredits),
      icon: BookMarked,
      variant: remainingCredits === 0 ? ("success" as const) : ("default" as const),
    },
  ];

  const thresholds = [
    { threshold: 3.2, label: "Cum Laude", color: "text-amber-600" },
    { threshold: 3.5, label: "Magna", color: "text-slate-400" },
    { threshold: 3.8, label: "Summa", color: "text-amber-400" },
  ];

  return (
    <>
      {/* ── Desktop layout (md+) ─────────────────────── */}
      <div className="hidden md:flex flex-col h-full overflow-hidden px-8 py-6">
        <div className="flex-1 flex items-center gap-8 min-h-0">
          <div className="flex flex-col gap-4 w-72 shrink-0">
            {leftStats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.08} />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-5 min-w-0">
            <GpaDisplay gpa={gpa} locale={locale} />

            {honorStatus && (
              <HonorBadge
                status={honorStatus}
                label={t(`honor.${honorStatus}`)}
                alertText={isAtRisk ? t(`alert.${honorStatus === "at_risk" ? "at_risk" : "academic_failure"}`) : undefined}
              />
            )}

            {gpa > 0 && (
              <div className="flex items-center gap-8 mt-1">
                {thresholds.map(({ threshold, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-0.5 w-8 rounded-full ${gpa >= threshold ? "opacity-80 bg-current" : "bg-border-strong"} ${color}`} />
                      <span className={`text-sm font-medium ${gpa >= threshold ? color : "text-text-muted"}`}>
                        {threshold.toFixed(2)}
                      </span>
                    </div>
                    <span className={`text-xs ${gpa >= threshold ? color : "text-text-muted"}`}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-72 shrink-0">
            {rightStats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.08 + 0.04} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile layout (< md) ─────────────────────── */}
      <div className="flex md:hidden flex-col h-full overflow-y-auto px-4 py-5 gap-5 pb-24">
        <div className="flex flex-col items-center gap-3">
          <GpaDisplay gpa={gpa} locale={locale} />
          {honorStatus && (
            <HonorBadge
              status={honorStatus}
              label={t(`honor.${honorStatus}`)}
              alertText={isAtRisk ? t(`alert.${honorStatus === "at_risk" ? "at_risk" : "academic_failure"}`) : undefined}
            />
          )}
        </div>

        {gpa > 0 && (
          <div className="flex items-center justify-center gap-4">
            {thresholds.map(({ threshold, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <div className={`h-0.5 w-5 rounded-full ${gpa >= threshold ? "opacity-80 bg-current" : "bg-border-strong"} ${color}`} />
                  <span className={`text-[10px] font-medium ${gpa >= threshold ? color : "text-text-muted"}`}>
                    {threshold.toFixed(1)}
                  </span>
                </div>
                <span className={`text-[9px] ${gpa >= threshold ? color : "text-text-muted"}`}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {[...leftStats, ...rightStats].map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </>
  );
}
