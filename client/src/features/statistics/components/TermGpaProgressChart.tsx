"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { getTermGpaProgression } from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/index";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/features/theme/store/useThemeStore";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl border border-border-base bg-bg-surface shadow-xl text-xs">
      <p className="font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TermGpaProgressChart() {
  const grades = useGpaStore((s) => s.grades);
  const selectedCohortId = useGpaStore((s) => s.selectedCohortId);
  const t = useTranslations("statistics");
  const tConfig = useTranslations("config");
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const terms = getTermsByCohortId(selectedCohortId);
  const data = getTermGpaProgression(grades, terms).map((item) => ({
    ...item,
    label: tConfig("term_label", { ordinal: item.termOrdinal }),
  }));

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e3a6e" : "#e2e8f0";

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        {t("no_data")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 8, right: 72, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="label"
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[0, 4]}
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 1, 2, 3, 3.5, 4]}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <ReferenceLine
          y={4.0}
          stroke="#10b981"
          strokeDasharray="4 3"
          label={{
            value: "President's",
            fill: "#10b981",
            fontSize: 10,
            position: "right",
          }}
        />
        <ReferenceLine
          y={3.5}
          stroke="#3b82f6"
          strokeDasharray="4 3"
          label={{
            value: "Dean's",
            fill: "#3b82f6",
            fontSize: 10,
            position: "right",
          }}
        />
        <Line
          type="monotone"
          dataKey="termGpa"
          name={t("term_gpa")}
          stroke="#1b9ef6"
          strokeWidth={2.5}
          dot={{ fill: "#1b9ef6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
