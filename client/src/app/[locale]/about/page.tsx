"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  User,
  Target,
  BookOpen,
  Calculator,
  Award,
  Users,
  Globe,
  Shield,
  Heart,
  Medal,
  Trophy,
  GraduationCap,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/core/lib/utils/cn";

type Props = {
  params: Promise<{ locale: string }>;
};

const GRADE_SCALE = [
  { grade: "A", range: "94–100", points: "4.0" },
  { grade: "A−", range: "90–93", points: "3.7" },
  { grade: "B+", range: "86–89", points: "3.3" },
  { grade: "B", range: "83–85", points: "3.0" },
  { grade: "B−", range: "80–82", points: "2.7" },
  { grade: "C+", range: "76–79", points: "2.3" },
  { grade: "C", range: "73–75", points: "2.0" },
  { grade: "C−", range: "70–72", points: "1.7" },
  { grade: "D+", range: "66–69", points: "1.3" },
  { grade: "D", range: "63–65", points: "1.0" },
  { grade: "D−", range: "60–62", points: "0.7" },
  { grade: "F", range: "< 60", points: "0.0" },
];

function Section({
  icon: Icon,
  title,
  delay,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-xl border border-border-base bg-bg-surface/80 backdrop-blur-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-base bg-bg-elevated/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-jala-700/15 text-text-accent shrink-0">
          <Icon size={16} />
        </div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">{label}:</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}

function HonorRow({
  icon: Icon,
  text,
  color,
}: {
  icon: LucideIcon;
  text: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={14} className={color} />
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  );
}

export default function AboutPage({ params }: Props) {
  use(params);
  const t = useTranslations("about");

  return (
    <div className="px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-screen-2xl mx-auto w-full">

      {/* ── Hero header ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-2 mb-6"
      >
        <span className="inline-flex items-center self-start gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-accent border border-text-accent/25 bg-text-accent/8 px-3 py-1 rounded-full">
          <GraduationCap size={12} />
          {t("unofficial_badge")}
        </span>
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{t("title")}</h1>
        <p className="text-sm text-text-secondary max-w-2xl">{t("subtitle")}</p>
      </motion.div>

      {/* ── Three-column bento grid ──────────────────────
          Each column is an independent flex-col stack.
          Cards keep their natural height — no stretching, no gaps.
          Mobile: single column stack (columns collapse in order)
          md+: three side-by-side columns
      ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* ── Column 1: About the project ─────────────── */}
        <div className="flex flex-col gap-4">

          <Section icon={User} title={t("project.title")} delay={0.06}>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t("project.description")}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
              <InfoRow
                label={t("project.developer_label")}
                value={
                  <a
                    href="https://www.linkedin.com/in/fernando-pinto-villarroel/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-accent hover:underline transition-colors"
                  >
                    {t("project.developer_name")}
                  </a>
                }
              />
              <InfoRow
                label={t("project.cohort_label")}
                value={t("project.cohort_value")}
              />
            </div>
          </Section>

          <Section icon={Target} title={t("purpose.title")} delay={0.1}>
            <ul className="flex flex-col gap-3">
              {[t("purpose.p1"), t("purpose.p2"), t("purpose.p3")].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-accent mt-1.5 shrink-0" />
                  <span className="text-sm text-text-secondary leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section icon={Calculator} title={t("gpa_calc.title")} delay={0.14} className="flex-1">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-jala-700/8 border border-jala-700/20">
                <span className="text-sm font-semibold text-text-accent font-mono leading-snug">
                  {t("gpa_calc.formula")}
                </span>
              </div>
              {[t("gpa_calc.p1"), t("gpa_calc.p2"), t("gpa_calc.credits_note")].map(
                (text, i) => (
                  <p key={i} className="text-sm text-text-secondary leading-relaxed">
                    {text}
                  </p>
                )
              )}
            </div>
          </Section>

        </div>

        {/* ── Column 2: The academic system ───────────── */}
        <div className="flex flex-col gap-4">

          <Section icon={BookOpen} title={t("grading.title")} delay={0.18}>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {t("grading.intro")}
                </p>
                <p className="text-sm text-text-accent font-medium mt-2">
                  {t("grading.example")}
                </p>
                <p className="text-xs text-text-muted leading-relaxed mt-3">
                  {t("grading.failing_note")}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  {t("grading.scale_title")}
                </p>
                <div className="rounded-lg border border-border-base overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-bg-elevated/80 border-b border-border-base">
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                          {t("grading.col_grade")}
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                          {t("grading.col_percentage")}
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                          {t("grading.col_points")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {GRADE_SCALE.map((row, i) => {
                        const points = parseFloat(row.points);
                        const isFailing = row.grade === "F" || row.grade === "D−";
                        const isExcellent = points >= 3.7;
                        const isGood = points >= 3.0 && !isExcellent;
                        return (
                          <tr
                            key={row.grade}
                            className={`border-b border-border-base last:border-b-0 ${i % 2 === 0 ? "" : "bg-bg-elevated/30"}`}
                          >
                            <td className="px-3 py-2">
                              <span
                                className={`font-semibold ${isExcellent ? "text-success" : isGood ? "text-text-accent" : isFailing ? "text-danger" : "text-warning"}`}
                              >
                                {row.grade}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-text-secondary">
                              {row.range}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-text-primary">
                              {row.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Section>

          <Section icon={Heart} title={t("acknowledgments.title")} delay={0.22} className="flex-1">
            <p className="text-sm text-text-secondary leading-relaxed">
              {t("acknowledgments.description")}
            </p>
          </Section>

        </div>

        {/* ── Column 3: Honors + additional info ──────── */}
        <div className="flex flex-col gap-4">

          <Section icon={Award} title={t("honors.title")} delay={0.26}>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  {t("honors.career_title")}
                </p>
                <p className="text-xs text-text-muted mb-2.5">
                  {t("honors.career_desc")}
                </p>
                <div className="flex flex-col gap-2">
                  <HonorRow icon={Award} text={t("honors.summa")} color="text-amber-400" />
                  <HonorRow icon={Award} text={t("honors.magna")} color="text-slate-400" />
                  <HonorRow icon={Award} text={t("honors.cum_laude")} color="text-amber-600" />
                </div>
              </div>

              <div className="h-px bg-border-base" />

              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  {t("honors.term_title")}
                </p>
                <p className="text-xs text-text-muted mb-2.5">
                  {t("honors.term_desc")}
                </p>
                <div className="flex flex-col gap-2">
                  <HonorRow icon={Trophy} text={t("honors.presidents_list")} color="text-amber-400" />
                  <HonorRow icon={Medal} text={t("honors.deans_list")} color="text-text-accent" />
                </div>
              </div>
            </div>
          </Section>

          <Section icon={Users} title={t("cohorts.title")} delay={0.3}>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t("cohorts.description")}
            </p>
          </Section>

          <Section icon={Globe} title={t("esp.title")} delay={0.34}>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t("esp.description")}
            </p>
          </Section>

          <Section icon={Shield} title={t("privacy.title")} delay={0.38}>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t("privacy.description")}
            </p>
          </Section>

        </div>

      </div>
    </div>
  );
}
