"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/core/lib/utils/cn";

interface GpaDisplayProps {
  gpa: number;
  locale: string;
}

function getGpaColor(gpa: number): string {
  if (gpa >= 3.8)
    return "text-amber-400 drop-shadow-[0_0_1px_rgba(255,255,255,0.9),0_0_2px_rgba(255,255,255,0.7)]";
  if (gpa >= 3.5) return "text-slate-500";
  if (gpa >= 3.2) return "text-amber-600";
  if (gpa >= 2.5) return "text-jala-400";
  if (gpa >= 2.0) return "text-text-primary";
  if (gpa > 0) return "text-danger";
  return "text-text-muted";
}

function getGpaRingColor(gpa: number): string {
  if (gpa >= 3.8) return "shadow-amber-400/20";
  if (gpa >= 3.5) return "shadow-slate-300/20";
  if (gpa >= 3.2) return "shadow-amber-600/20";
  if (gpa >= 2.0) return "shadow-jala-600/20";
  if (gpa > 0) return "shadow-danger/20";
  return "shadow-border-base";
}

export function GpaDisplay({ gpa, locale }: GpaDisplayProps) {
  const t = useTranslations("home");
  const hasGpa = gpa > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", damping: 20 }}
        className={cn(
          "relative flex items-center justify-center w-56 h-56 rounded-full",
          "border-2 border-jala-700/50 bg-bg-surface",
          "shadow-2xl",
          getGpaRingColor(gpa),
        )}
      >
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            background: hasGpa
              ? "radial-gradient(circle at 30% 30%, #2a4ff5 0%, transparent 70%)"
              : "transparent",
          }}
        />
        <div className="relative text-center">
          {hasGpa ? (
            <>
              <motion.span
                key={gpa}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "block text-6xl font-bold tabular-nums tracking-tight",
                  getGpaColor(gpa),
                )}
              >
                {gpa.toFixed(2)}
              </motion.span>
              <span className="block text-sm text-text-muted mt-1.5 font-medium uppercase tracking-wider">
                {t("gpa_label")}
              </span>
            </>
          ) : (
            <span className="text-base text-text-muted text-center px-4">
              {t("no_grades")}
            </span>
          )}
        </div>
      </motion.div>

      {!hasGpa && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href={`/${locale}/config`}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
              "bg-jala-700 text-white hover:bg-jala-800 transition-colors",
            )}
          >
            {t("go_to_config")}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
