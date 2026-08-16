"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTermsByCohortId } from "@/features/gpa/data/software-engineering-design-architecture/index";
import { cn } from "@/core/lib/utils/cn";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";

export function TermSelector() {
  const t = useTranslations("config");
  const { selectedTermId, selectedCohortId, setSelectedTermId } = useGpaStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const terms = getTermsByCohortId(selectedCohortId);
  const selectedTerm = terms.find((t) => t.id === selectedTermId) ?? terms[0];

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
    <div ref={ref} data-tour="term-selector" className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium",
          "border border-border-base bg-bg-surface",
          "text-text-primary hover:border-border-accent",
          "transition-colors duration-200 min-w-[120px] sm:min-w-[140px] md:min-w-44",
        )}
      >
        <Calendar size={14} className="text-text-accent shrink-0" />
        <span className="flex-1 text-left truncate">
          {selectedTerm ? t("term_label", { ordinal: selectedTerm.ordinal }) : t("select_term")}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-muted transition-transform shrink-0",
            open && "rotate-180",
          )}
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
              "absolute left-0 top-11 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-52",
            )}
          >
            {terms.map((term) => (
              <button
                key={term.id}
                onClick={() => {
                  setSelectedTermId(term.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left transition-colors",
                  term.id === selectedTermId
                    ? "bg-jala-700/15 text-text-accent font-medium"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                )}
              >
                {t("term_label", { ordinal: term.ordinal })}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
