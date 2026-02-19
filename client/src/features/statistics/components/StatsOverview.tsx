"use client";

import { motion } from "framer-motion";
import { TrendingUp, BookOpen, Award, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { calculateGpa, getHonorStatus } from "@/features/gpa/services/calculator";
import { getTotalCredits } from "@/features/gpa/data/courseData";
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
      className="flex items-center gap-3 p-4 rounded-xl border border-border-base bg-bg-surface"
    >
      <div className={cn("flex items-center justify-center w-10 h-10 rounded-xl", color)}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-xl font-bold text-text-primary leading-tight">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

const HONOR_LABELS: Record<string, string> = {
  summa_cum_laude: "Summa Cum Laude",
  magna_cum_laude: "Magna Cum Laude",
  cum_laude: "Cum Laude",
  good_standing: "Good Standing",
  at_risk: "At Risk",
  academic_failure: "Academic Failure",
};

export function StatsOverview() {
  const t = useTranslations("statistics");
  const grades = useGpaStore((s) => s.grades);
  const { gpa, completedCredits, completedCourses, totalCourses } = calculateGpa(grades);
  const honorStatus = getHonorStatus(gpa);
  const totalCred = getTotalCredits();
  const completion = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  const cards = [
    {
      icon: TrendingUp,
      label: t("overview.current_gpa"),
      value: gpa > 0 ? gpa.toFixed(3) : "—",
      color: "text-jala-400 bg-jala-700/15",
      delay: 0,
    },
    {
      icon: BookOpen,
      label: t("overview.total_credits"),
      value: String(completedCredits),
      sub: `of ${totalCred} total`,
      color: "text-success bg-success/15",
      delay: 0.06,
    },
    {
      icon: Target,
      label: t("overview.completion"),
      value: `${completion}%`,
      sub: `${completedCourses} of ${totalCourses} courses`,
      color: "text-warning bg-warning/15",
      delay: 0.12,
    },
    {
      icon: Award,
      label: t("overview.projected_honor"),
      value: honorStatus ? (HONOR_LABELS[honorStatus] ?? honorStatus) : "—",
      color: "text-amber-400 bg-amber-400/15",
      delay: 0.18,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <OverviewCard key={card.label} {...card} />
      ))}
    </div>
  );
}
