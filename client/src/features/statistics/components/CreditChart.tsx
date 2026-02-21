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
import { getCreditsPerTerm } from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/index";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/features/theme/store/useThemeStore";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; fill: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl border border-border-base bg-bg-surface shadow-xl text-xs">
      <p className="font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm" style={{ background: p.fill }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold text-text-primary">{p.value} cr</span>
        </div>
      ))}
    </div>
  );
}

export function CreditChart() {
  const grades = useGpaStore((s) => s.grades);
  const selectedCohortId = useGpaStore((s) => s.selectedCohortId);
  const t = useTranslations("statistics");
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const terms = getTermsByCohortId(selectedCohortId);
  const raw = getCreditsPerTerm(grades, terms);
  const data = raw.map((d) => ({
    label: d.termLabel.split(" - ")[0],
    earned: d.earned,
    remaining: d.total - d.earned,
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
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(42,79,245,0.08)" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Bar
          dataKey="earned"
          name={t("credits_earned")}
          fill="#2a4ff5"
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
        <Bar
          dataKey="remaining"
          name={t("remaining_credits")}
          fill={isDark ? "#475569" : "#94a3b8"}
          radius={[3, 3, 0, 0]}
          stackId="a"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
