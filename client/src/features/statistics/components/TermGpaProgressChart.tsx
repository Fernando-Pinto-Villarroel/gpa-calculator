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
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { getTermGpaProgression } from "@/features/gpa/services/calculator";
import { getTermsByCohortId } from "@/features/gpa/data/software-engineering-design-architecture/index";
import { getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { getCareerPalette } from "@/features/career/theme";

const SCALE_EXP = 1.3;
const gpaToScale = (v: number) => Math.pow(v, SCALE_EXP);
const scaleToGpa = (v: number) => Math.pow(v, 1 / SCALE_EXP);

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
            {scaleToGpa(p.value).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TermGpaProgressChart() {
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
  // A fixed reference line already uses blue (#3b82f6) for the Dean's List
  // threshold below — pick a shade for the data line that stays visually
  // distinct from it regardless of career (accent700 is Commercial SE's
  // #0d49a9, clearly darker than #3b82f6; every other career's accent700
  // is a different hue entirely).
  const { accent700: lineColor } = getCareerPalette(selectedCareerId);

  const terms = isEsp
    ? getEspTermsByCohortId(espCohortId)
    : getTermsByCohortId(commercialCohortId);
  const data = getTermGpaProgression(grades, terms).map((item) => ({
    ...item,
    label: tConfig(isEsp ? "level_label" : "term_label", {
      ordinal: item.termOrdinal,
    }),
    termGpa: gpaToScale(item.termGpa),
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
          domain={[0, gpaToScale(4)]}
          tick={{ fill: axisColor, fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          ticks={[0, 1, 2, 3, 3.5, 4].map(gpaToScale)}
          tickFormatter={(v: number) => scaleToGpa(v).toFixed(1)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8, paddingLeft: 65 }}
        />
        <ReferenceLine
          y={gpaToScale(4.0)}
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
          y={gpaToScale(3.5)}
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
          stroke={lineColor}
          strokeWidth={2.5}
          dot={{ fill: lineColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
