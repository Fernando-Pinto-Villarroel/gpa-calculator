"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  Star,
  TriangleAlert,
  CreditCard,
  BookMarked,
  Timer,
  Medal,
  Trophy,
} from "lucide-react";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import {
  calculateGpa,
  getHonorStatus,
  getBestAndWorstCourses,
  getCompletedTermsCount,
  getTermHonorCounts,
} from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/index";
import { letterGradesMap } from "@/core/domain/types/letterGrades";
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
  const tCourses = useTranslations("courses");
  const tConfig = useTranslations("config");
  const grades = useGpaStore((s) => s.grades);
  const selectedCohortId = useGpaStore((s) => s.selectedCohortId);
  const terms = getTermsByCohortId(selectedCohortId);

  const {
    gpa,
    completedCourses,
    approvedCourses,
    approvedCredits,
    totalCredits,
    totalCourses,
  } = calculateGpa(grades, terms);
  const honorStatus = getHonorStatus(gpa);
  const { best, worst, bestCourses, worstCourses } = getBestAndWorstCourses(
    grades,
    terms,
  );
  const termsCompleted = getCompletedTermsCount(grades, terms);
  const { deansListCount, presidentsListCount } = getTermHonorCounts(
    grades,
    terms,
  );

  const isAtRisk =
    honorStatus === "at_risk" || honorStatus === "academic_failure";

  const leftStats = [
    {
      label: t("stats.completed_subjects"),
      value: String(approvedCourses),
      subvalue: `/ ${totalCourses}`,
      icon: BookOpen,
      tooltip: `${approvedCourses} approved · ${completedCourses} graded`,
    },
    {
      label: t("stats.best_grade"),
      value: best ? `${best.grade}` : "—",
      subvalue: best
        ? bestCourses.length > 1
          ? `${bestCourses.length} ${t("stats.courses")}`
          : tCourses(best.courseCode)
        : undefined,
      icon: Star,
      variant:
        best && letterGradesMap[best.grade!] >= 3.7
          ? ("success" as const)
          : ("default" as const),
      tooltip: best
        ? bestCourses.length > 1
          ? `${bestCourses.length} courses`
          : `${tCourses(best.courseCode)} — ${tConfig("term_label", { ordinal: best.termOrdinal })}`
        : undefined,
    },
    {
      label: t("stats.terms_completed"),
      value: String(termsCompleted),
      subvalue: `${tc("of")} ${terms.length}`,
      icon: Timer,
    },
    {
      label: t("stats.deans_list_terms"),
      value: String(deansListCount),
      icon: Medal,
      variant: deansListCount > 0 ? ("default" as const) : ("default" as const),
    },
  ];

  const rightStats = [
    {
      label: t("stats.worst_grade"),
      value: worst ? `${worst.grade}` : "—",
      subvalue: worst
        ? worstCourses.length > 1
          ? `${worstCourses.length} ${t("stats.courses")}`
          : tCourses(worst.courseCode)
        : undefined,
      icon: TriangleAlert,
      variant:
        worst && letterGradesMap[worst.grade!] < 2.0
          ? ("danger" as const)
          : worst && letterGradesMap[worst.grade!] < 3.0
            ? ("warning" as const)
            : ("default" as const),
      tooltip: worst
        ? worstCourses.length > 1
          ? `${worstCourses.length} courses`
          : `${tCourses(worst.courseCode)} — ${tConfig("term_label", { ordinal: worst.termOrdinal })}`
        : undefined,
    },
    {
      label: t("stats.earned_credits"),
      value: String(approvedCredits),
      subvalue: `${tc("of")} ${totalCredits}`,
      icon: CreditCard,
      variant: "success" as const,
    },
    {
      label: t("stats.remaining_credits"),
      value: String(totalCredits - approvedCredits),
      icon: BookMarked,
      variant:
        approvedCredits >= totalCredits ? ("success" as const) : ("default" as const),
    },
    {
      label: t("stats.presidents_list_terms"),
      value: String(presidentsListCount),
      icon: Trophy,
      variant:
        presidentsListCount > 0 ? ("gold" as const) : ("default" as const),
    },
  ];

  const thresholds = [
    { threshold: 3.2, label: "Cum Laude", color: "text-amber-600" },
    { threshold: 3.5, label: "Magna", color: "text-slate-400" },
    { threshold: 3.8, label: "Summa", color: "text-amber-400" },
  ];

  return (
    <>
      <div className="hidden lg:flex flex-col h-full overflow-hidden px-8 py-6">
        <div className="flex-1 flex items-center justify-center gap-12 min-h-0 max-w-7xl mx-auto w-full">
          <div data-tour="stat-cards" className="flex flex-col gap-4 w-1/4 min-w-[200px] max-w-[320px]">
            {leftStats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 0.08} isDesktop />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 min-w-0">
            <div data-tour="gpa-display">
              <GpaDisplay gpa={gpa} locale={locale} isDesktop />
            </div>

            {honorStatus && (
              <div data-tour="honor-badge">
                <HonorBadge
                  status={honorStatus}
                  label={t(`honor.${honorStatus}`)}
                  alertText={
                    isAtRisk
                      ? t(
                          `alert.${honorStatus === "at_risk" ? "at_risk" : "academic_failure"}`,
                        )
                      : undefined
                  }
                />
              </div>
            )}

            {gpa > 0 && (
              <div className="flex items-center gap-10 mt-1">
                {thresholds.map(({ threshold, label, color }) => {
                  const isCurrentHonor =
                    gpa >= threshold &&
                    !thresholds.some(
                      (t) => t.threshold > threshold && gpa >= t.threshold,
                    );
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-0.5 w-10 rounded-full ${gpa >= threshold ? "opacity-80 bg-current" : "bg-border-strong"} ${color}`}
                        />
                        <span
                          className={`font-medium ${gpa >= threshold ? color : "text-text-muted"} ${isCurrentHonor ? "text-xl" : "text-base"}`}
                        >
                          {threshold.toFixed(2)}
                        </span>
                      </div>
                      <span
                        className={`${gpa >= threshold ? color : "text-text-muted"} ${isCurrentHonor ? "text-lg font-semibold" : "text-sm"}`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 w-1/4 min-w-[200px] max-w-[320px]">
            {rightStats.map((stat, i) => (
              <StatCard
                key={stat.label}
                {...stat}
                delay={i * 0.08 + 0.04}
                isDesktop
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex lg:hidden flex-col px-4 py-5 gap-5 pb-24">
        <div className="flex flex-col items-center gap-3">
          <div data-tour="gpa-display-m">
            <GpaDisplay gpa={gpa} locale={locale} />
          </div>
          {honorStatus && (
            <div data-tour="honor-badge-m">
              <HonorBadge
                status={honorStatus}
                label={t(`honor.${honorStatus}`)}
                alertText={
                  isAtRisk
                    ? t(
                        `alert.${honorStatus === "at_risk" ? "at_risk" : "academic_failure"}`,
                      )
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {gpa > 0 && (
          <div className="flex items-center justify-center gap-4">
            {thresholds.map(({ threshold, label, color }) => {
              const isCurrentHonor =
                gpa >= threshold &&
                !thresholds.some(
                  (t) => t.threshold > threshold && gpa >= t.threshold,
                );
              return (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-0.5 w-5 rounded-full ${gpa >= threshold ? "opacity-80 bg-current" : "bg-border-strong"} ${color}`}
                    />
                    <span
                      className={`font-medium ${gpa >= threshold ? color : "text-text-muted"} ${isCurrentHonor ? "text-xs" : "text-[10px]"}`}
                    >
                      {threshold.toFixed(1)}
                    </span>
                  </div>
                  <span
                    className={`${gpa >= threshold ? color : "text-text-muted"} ${isCurrentHonor ? "text-xs font-semibold" : "text-[9px]"}`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div data-tour="stat-cards-m" className="grid grid-cols-2 gap-2.5">
          {[...leftStats, ...rightStats].map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </>
  );
}
