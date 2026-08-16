"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Monitor, Languages, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { CAREERS, type CareerId } from "@/core/domain/types/career";
import { useCareerStore } from "@/features/career/store/useCareerStore";
import { cn } from "@/core/lib/utils/cn";

const CAREER_ICONS: Record<CareerId, LucideIcon> = {
  software_engineering_design_architecture: Monitor,
  esp: Languages,
};

export function CareerSelector() {
  const t = useTranslations("nav");
  const { selectedCareerId, setSelectedCareerId } = useCareerStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const SelectedIcon = CAREER_ICONS[selectedCareerId];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} data-tour="navbar-career" className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("career_selector_label")}
        className={cn(
          "flex items-center gap-1.5 px-2 sm:px-2.5 h-9 rounded-lg text-sm font-medium",
          "border border-white/30 bg-white/15 text-white hover:bg-white/25 hover:border-white/50",
          "transition-colors duration-200 max-w-[120px] sm:max-w-[220px]",
        )}
      >
        <SelectedIcon size={14} className="shrink-0" />
        <span className="hidden sm:inline truncate">
          {t(CAREERS.find((c) => c.id === selectedCareerId)?.labelKey ?? CAREERS[0].labelKey)}
        </span>
        <ChevronDown
          size={13}
          className={cn("shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute right-0 top-11 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-56",
            )}
          >
            {CAREERS.map((career) => {
              const Icon = CAREER_ICONS[career.id];
              return (
                <button
                  key={career.id}
                  onClick={() => {
                    setSelectedCareerId(career.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-sm text-left transition-colors",
                    career.id === selectedCareerId
                      ? "bg-jala-700/15 text-text-accent font-medium"
                      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                  )}
                >
                  <Icon size={14} className="shrink-0" />
                  {t(career.labelKey)}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
