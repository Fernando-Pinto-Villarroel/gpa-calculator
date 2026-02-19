"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { StatsOverview } from "@/features/statistics/components/StatsOverview";

const GpaProgressChart = dynamic(
  () => import("@/features/statistics/components/GpaProgressChart").then((m) => m.GpaProgressChart),
  { ssr: false }
);
const GradeDistributionChart = dynamic(
  () => import("@/features/statistics/components/GradeDistributionChart").then((m) => m.GradeDistributionChart),
  { ssr: false }
);
const CreditChart = dynamic(
  () => import("@/features/statistics/components/CreditChart").then((m) => m.CreditChart),
  { ssr: false }
);

function ChartCard({
  title,
  description,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-1 p-4 min-h-0">{children}</div>
    </motion.div>
  );
}

export default function StatisticsPage() {
  const t = useTranslations("statistics");

  return (
    <div className="flex flex-col min-h-full gap-4 px-4 md:px-6 py-5 pb-24 md:pb-8">
      <StatsOverview />

      <ChartCard
        title={t("gpa_progression")}
        description={t("gpa_progression_desc")}
        delay={0.1}
      >
        <div className="h-56 md:h-64">
          <GpaProgressChart />
        </div>
      </ChartCard>

      <ChartCard
        title={t("grade_distribution")}
        description={t("grade_distribution_desc")}
        delay={0.18}
      >
        <div className="h-56 md:h-64">
          <GradeDistributionChart />
        </div>
      </ChartCard>

      <ChartCard
        title={t("credit_accumulation")}
        description={t("credit_accumulation_desc")}
        delay={0.24}
      >
        <div className="h-44 md:h-48">
          <CreditChart />
        </div>
      </ChartCard>
    </div>
  );
}
