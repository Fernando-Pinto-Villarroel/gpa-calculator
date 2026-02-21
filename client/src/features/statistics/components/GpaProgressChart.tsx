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
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GpaProgressChart() {
  const grades = useGpaStore((s) => s.grades);
  const selectedCohortId = useGpaStore((s) => s.selectedCohortId);
  const t = useTranslations("statistics");
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const terms = getTermsByCohortId(selectedCohortId);
  const data = getTermGpaProgression(grades, terms);

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
      <LineChart data={data} margin={{ top: 8, right: 72, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="label"
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => v.split(" ")[0] + " " + v.split(" ")[1]}
        />
        <YAxis
          domain={[0, 4]}
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 1, 2, 3, 3.2, 3.5, 3.8, 4]}
          tickFormatter={(v: number) => v.toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <ReferenceLine
          y={3.8}
          stroke="#f59e0b"
          strokeDasharray="4 3"
          label={{ value: "Summa", fill: "#f59e0b", fontSize: 10, position: "right" }}
        />
        <ReferenceLine
          y={3.5}
          stroke="#94a3b8"
          strokeDasharray="4 3"
          label={{ value: "Magna", fill: "#94a3b8", fontSize: 10, position: "right" }}
        />
        <ReferenceLine
          y={3.2}
          stroke="#b45309"
          strokeDasharray="4 3"
          label={{ value: "Cum Laude", fill: "#b45309", fontSize: 10, position: "right" }}
        />
        <ReferenceLine
          y={2.0}
          stroke="#ef4444"
          strokeDasharray="4 3"
          label={{ value: "Min", fill: "#ef4444", fontSize: 10, position: "right" }}
        />
        <Line
          type="monotone"
          dataKey="cumulativeGpa"
          name={t("cumulative_gpa")}
          stroke="#2a4ff5"
          strokeWidth={2.5}
          dot={{ fill: "#2a4ff5", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="termGpa"
          name={t("term_gpa")}
          stroke="#1b9ef6"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          dot={{ fill: "#1b9ef6", r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
