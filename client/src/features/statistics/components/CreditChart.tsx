"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { getCreditsPerTerm } from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/software-engineering-design-architecture/index";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { getCareerPalette, withAlpha } from "@/features/career/theme";

interface ChartDataPoint {
  label: string;
  earned: number;
  remaining: number;
  coursesCompleted: number;
  coursesPending: number;
  totalCourses: number;
}

function CustomTooltip({
  active,
  payload,
  label,
  isEsp,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string; payload: ChartDataPoint }[];
  label?: string;
  isEsp?: boolean;
}) {
  const t = useTranslations("statistics");

  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="px-3 py-2.5 rounded-xl border border-border-base bg-bg-surface shadow-xl text-xs">
      <p className="font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold text-text-primary">
            {p.value}
            {isEsp ? "" : " cr"}
          </span>
        </div>
      ))}
      <div className="mt-2 pt-2 border-t border-border-base flex flex-col gap-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">{t("courses_completed")}:</span>
          <span className="font-semibold text-text-primary">
            {data.coursesCompleted} / {data.totalCourses}
          </span>
        </div>
        {data.coursesPending > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-text-secondary">{t("courses_pending")}:</span>
            <span className="font-semibold text-warning">{data.coursesPending}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CreditChart() {
  const { selectedCareerId } = useCareerStore();
  const isEsp = selectedCareerId === "esp";
  const commercialGrades = useGpaStore((s) => s.grades);
  const commercialCohortId = useGpaStore((s) => s.selectedCohortId);
  const espGrades = useEspGpaStore((s) => s.grades);
  const espCohortId = useEspGpaStore((s) => s.selectedCohortId);
  const grades = isEsp ? espGrades : commercialGrades;
  const t = useTranslations("statistics");
  const tConfig = useTranslations("config");
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";
  const { accent500 } = getCareerPalette(selectedCareerId);

  const terms = isEsp
    ? getEspTermsByCohortId(espCohortId)
    : getTermsByCohortId(commercialCohortId);
  const raw = getCreditsPerTerm(grades, terms);
  const data: ChartDataPoint[] = raw.map((d) => ({
    label: tConfig(isEsp ? "level_label" : "term_label", {
      ordinal: d.termOrdinal,
    }),
    earned: isEsp ? d.coursesCompleted : d.earned,
    remaining: isEsp ? d.coursesPending : d.total - d.earned,
    coursesCompleted: d.coursesCompleted,
    coursesPending: d.coursesPending,
    totalCourses: d.totalCourses,
  }));

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e3a6e" : "#e2e8f0";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip isEsp={isEsp} />}
          cursor={{ fill: withAlpha(accent500, 0.08) }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar
          dataKey="earned"
          name={isEsp ? t("courses_completed") : t("credits_earned")}
          fill={accent500}
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
        <Bar
          dataKey="remaining"
          name={isEsp ? t("courses_pending") : t("remaining_credits")}
          fill={isDark ? "#475569" : "#94a3b8"}
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
