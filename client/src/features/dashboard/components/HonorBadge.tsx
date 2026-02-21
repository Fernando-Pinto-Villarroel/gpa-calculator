"use client";

import { motion } from "framer-motion";
import { Award, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { HonorStatus } from "@/features/gpa/services/calculator";
import { cn } from "@/core/lib/utils/cn";

interface HonorBadgeProps {
  status: HonorStatus;
  label: string;
  alertText?: string;
}

const statusConfig: Record<
  NonNullable<HonorStatus>,
  {
    icon: typeof Award;
    className: string;
    iconClass: string;
  }
> = {
  summa_cum_laude: {
    icon: Award,
    className: "border-amber-400/40 bg-amber-400/10 text-amber-400",
    iconClass: "text-amber-400",
  },
  magna_cum_laude: {
    icon: Award,
    className: "border-slate-300/40 bg-slate-300/10 text-slate-500",
    iconClass: "text-slate-500",
  },
  cum_laude: {
    icon: Award,
    className: "border-amber-700/40 bg-amber-700/10 text-amber-600",
    iconClass: "text-amber-600",
  },
  good_standing: {
    icon: TrendingUp,
    className: "border-success/30 bg-success/10 text-success",
    iconClass: "text-success",
  },
  at_risk: {
    icon: AlertTriangle,
    className: "border-warning/40 bg-warning/10 text-warning",
    iconClass: "text-warning",
  },
  academic_failure: {
    icon: XCircle,
    className: "border-danger/40 bg-danger/10 text-danger",
    iconClass: "text-danger",
  },
};

export function HonorBadge({ status, label, alertText }: HonorBadgeProps) {
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;
  const isAlertStatus = status === "at_risk" || status === "academic_failure";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "flex items-center gap-3 px-5 py-3 rounded-full border",
        config.className,
      )}
    >
      {isAlertStatus ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Icon size={18} className={config.iconClass} />
            <p className="text-base font-semibold">{label}</p>
          </div>
          {alertText && <p className="text-sm opacity-80">{alertText}</p>}
        </div>
      ) : (
        <>
          <Icon size={18} className={config.iconClass} />
          <div className="text-center">
            <p className="text-base font-semibold">{label}</p>
            {alertText && (
              <p className="text-sm opacity-80 mt-0.5">{alertText}</p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
