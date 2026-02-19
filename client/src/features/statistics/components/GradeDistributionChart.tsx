"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { getGradeDistribution } from "@/features/gpa/services/calculator";
import { ALL_GRADES, letterGradesMap } from "@/core/domain/types/letterGrades";
import { useThemeStore } from "@/features/theme/store/useThemeStore";

function gradeBarColor(grade: string): string {
  const pts = letterGradesMap[grade as keyof typeof letterGradesMap] ?? 0;
  if (pts >= 3.7) return "#10b981";
  if (pts >= 3.0) return "#2281f5";
  if (pts >= 2.0) return "#f59e0b";
  return "#ef4444";
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { grade: string } }[] }) {
  if (!active || !payload?.length) return null;
  const { grade } = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-xl border border-border-base bg-bg-surface shadow-xl text-xs">
      <p className="font-semibold text-text-primary">{grade}</p>
      <p className="text-text-secondary">{payload[0].value} courses</p>
    </div>
  );
}

export function GradeDistributionChart() {
  const grades = useGpaStore((s) => s.grades);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const distribution = getGradeDistribution(grades);
  const data = ALL_GRADES.map((g) => ({
    grade: g,
    count: distribution[g] ?? 0,
  })).filter((d) => d.count > 0);

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e3a6e" : "#e2e8f0";

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-text-muted">
        No grade data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="grade"
          tick={{ fill: axisColor, fontSize: 11, fontWeight: 600 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(42,79,245,0.08)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((d) => (
            <Cell key={d.grade} fill={gradeBarColor(d.grade)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
