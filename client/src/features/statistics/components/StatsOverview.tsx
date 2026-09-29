"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  Award,
  Target,
  Medal,
  Trophy,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import {
  calculateGpa,
  getAcademicStanding,
  getRateOfProgress,
  getTermHonorCounts,
} from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/software-engineering-design-architecture/index";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { getEspTermsForPlacement, resolveEspPlacementLevel } from "@/features/esp/lib/placement";
import { calculateEspCompletion } from "@/features/esp/lib/completion";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { cn } from "@/core/lib/utils/cn";

function OverviewCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex items-center gap-3 p-4 rounded-xl border border-border-base bg-bg-surface min-h-[6rem]"
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl",
          color,
        )}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-primary leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function StatsOverview() {
  const t = useTranslations("statistics");
  const tHome = useTranslations("home");
  const { selectedCareerId } = useCareerStore();
  const isEsp = selectedCareerId === "esp";
  const commercialGrades = useGpaStore((s) => s.grades);
  const commercialCohortId = useGpaStore((s) => s.selectedCohortId);
  const espGrades = useEspGpaStore((s) => s.grades);
  const espCohortId = useEspGpaStore((s) => s.selectedCohortId);
  const espPlacementLevel = useEspGpaStore((s) => s.placementLevel);
  const grades = isEsp ? espGrades : commercialGrades;
  const rawEspTerms = getEspTermsByCohortId(espCohortId);
  const resolvedEspLevel = resolveEspPlacementLevel(espGrades, rawEspTerms, espPlacementLevel);
  const terms = isEsp
    ? getEspTermsForPlacement(rawEspTerms, resolvedEspLevel)
    : getTermsByCohortId(commercialCohortId);

  const {
    gpa,
    completedCourses,
    approvedCredits,
    attemptedCredits,
    approvedCourses,
    totalCourses,
    totalCredits,
  } = calculateGpa(grades, terms);
  const hasGrades = completedCourses > 0;
  const honorStatus = hasGrades
    ? getAcademicStanding(gpa, getRateOfProgress({ approvedCredits, attemptedCredits })).status
    : null;
  const espCompletion = isEsp ? calculateEspCompletion(grades, terms) : null;
  const completedCoursesForDisplay = espCompletion
    ? espCompletion.completedCourses
    : approvedCourses;
  const totalCoursesForDisplay = espCompletion
    ? espCompletion.totalCourses
    : totalCourses;
  const completion = espCompletion
    ? espCompletion.completionPercent
    : totalCourses > 0
      ? Math.round((approvedCourses / totalCourses) * 100)
      : 0;
  const { deansListCount, presidentsListCount } = isEsp
    ? { deansListCount: 0, presidentsListCount: 0 }
    : getTermHonorCounts(grades, terms);

  const cards = [
    {
      icon: TrendingUp,
      label: t("overview.current_gpa"),
      value: hasGrades ? gpa.toFixed(3) : "—",
      color: "text-jala-400 bg-jala-700/15",
      delay: 0,
    },
    isEsp
      ? {
          icon: BookOpen,
          label: t("overview.total_courses_completed"),
          value: String(completedCoursesForDisplay),
          sub: `of ${totalCoursesForDisplay} total`,
          color: "text-success bg-success/15",
          delay: 0.06,
        }
      : {
          icon: BookOpen,
          label: t("overview.total_credits"),
          value: String(approvedCredits),
          sub: `of ${totalCredits} total`,
          color: "text-success bg-success/15",
          delay: 0.06,
        },
    {
      icon: Target,
      label: t("overview.completion"),
      value: `${completion}%`,
      sub: `${completedCoursesForDisplay} of ${totalCoursesForDisplay} courses`,
      color: "text-warning bg-warning/15",
      delay: 0.12,
    },
    ...(isEsp
      ? []
      : [
          {
            icon: Award,
            label: t("overview.projected_honor"),
            value: honorStatus ? tHome(`honor.${honorStatus}`) : "—",
            color: "text-amber-400 bg-amber-400/15",
            delay: 0.18,
          },
          {
            icon: Medal,
            label: t("overview.deans_list_terms"),
            value: String(deansListCount),
            color: "text-text-accent bg-jala-700/15",
            delay: 0.24,
          },
          {
            icon: Trophy,
            label: t("overview.presidents_list_terms"),
            value: String(presidentsListCount),
            color: "text-amber-400 bg-amber-400/15",
            delay: 0.3,
          },
        ]),
  ];

  return (
    <div data-tour="stats-overview" className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card) => (
        <OverviewCard key={card.label} {...card} />
      ))}
    </div>
  );
}
