"use client";

import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { LucideIcon } from "lucide-react";
import { cn } from "@/core/lib/utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  icon: LucideIcon;
  tooltip?: string;
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
  tooltip,
  variant = "default",
  delay = 0,
  isDesktop = false,
}: StatCardProps) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "flex items-center rounded-xl border bg-bg-surface",
        "hover:border-border-strong transition-colors duration-200",
        variantStyles[variant],
        isDesktop ? "p-6 gap-5" : "p-4 gap-4",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          iconVariantStyles[variant],
          isDesktop ? "w-14 h-14" : "w-11 h-11",
        )}
      >
        <Icon size={isDesktop ? 24 : 20} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-text-muted truncate",
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
              "text-text-muted truncate leading-none mt-0.5",
              isDesktop ? "text-sm" : "text-xs",
            )}
          >
            {subvalue}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (!tooltip) return card;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{card}</TooltipTrigger>
      <TooltipContent
        side="right"
        className="px-2.5 py-1.5 rounded-lg text-xs bg-bg-elevated border border-border-base text-text-secondary shadow-md max-w-48"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
