"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/core/lib/utils/cn";
import { InfoTooltip } from "@/shared/components/ui/InfoTooltip";

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  info?: string;
  detail?: string;
  variant?: "default" | "success" | "warning" | "danger" | "gold";
  delay?: number;
  isDesktop?: boolean;
}

const variantStyles = {
  default: "border-border-base",
  success: "border-success/30",
  warning: "border-warning/30",
  danger: "border-danger/30",
  gold: "border-amber-400/30",
};

const iconVariantStyles = {
  default: "text-text-accent bg-jala-700/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
  gold: "text-amber-400 bg-amber-400/10",
};

export function StatCard({
  label,
  value,
  subvalue,
  icon: Icon,
  info,
  detail,
  variant = "default",
  delay = 0,
  isDesktop = false,
}: StatCardProps) {
  const t = useTranslations("home.stats_info");

  return (
    <motion.div
      data-testid="stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative flex rounded-xl border bg-bg-surface",
        "hover:border-border-strong transition-colors duration-200",
        variantStyles[variant],
        isDesktop
          ? "items-center p-4 gap-4 h-28 overflow-hidden"
          : "flex-col items-center justify-center text-center h-[9.75rem] p-4 gap-2 sm:h-auto sm:flex-row sm:items-center sm:gap-4 sm:text-left sm:h-full",
      )}
    >
      {info && (
        <InfoTooltip
          text={info}
          detail={detail}
          label={t("label", { stat: label })}
          iconSize={isDesktop ? 15 : 14}
          className={cn(
            "absolute",
            isDesktop ? "top-2.5 right-2.5" : "top-2 right-2",
          )}
        />
      )}
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          iconVariantStyles[variant],
          isDesktop ? "w-14 h-14" : "w-10 h-10",
        )}
      >
        <Icon size={isDesktop ? 24 : 18} />
      </div>
      <div
        className={cn(
          "min-w-0 w-full sm:flex-1",
          info && (isDesktop ? "pr-3" : "sm:pr-3"),
        )}
      >
        <p
          className={cn(
            "text-text-muted leading-tight line-clamp-2",
            isDesktop ? "text-sm" : "text-xs",
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-semibold text-text-primary truncate leading-tight mt-0.5",
            isDesktop ? "text-lg" : "text-base",
          )}
        >
          {value}
        </p>
        {subvalue && (
          <p
            className={cn(
              "text-text-muted truncate leading-tight mt-0.5",
              isDesktop ? "text-sm" : "text-xs",
            )}
          >
            {subvalue}
          </p>
        )}
      </div>
    </motion.div>
  );
}
