"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Download, Upload, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { useTourSteps } from "@/features/tour/hooks/useTourSteps";
import { cn } from "@/core/lib/utils/cn";
import { getEspCohortById } from "@/features/gpa/data/esp";
import { validateEspImportPayload } from "@/features/esp/lib/validateEspImportPayload";
import Swal from "sweetalert2";

const TOUR_TARGETED_ITEMS = [
  '[data-tour="action-import"]',
  '[data-tour="action-export"]',
  '[data-tour="action-reset"]',
];

export function EspActionsMenu({ className }: { className?: string }) {
  const t = useTranslations("config");
  const { importGrades, exportGrades, resetCohortData } = useEspGpaStore();
  const { theme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isActive: tourActive, globalStepIndex } = useTourStore();
  const tourSteps = useTourSteps();
  const currentTourTarget = tourActive
    ? tourSteps[globalStepIndex]?.target
    : undefined;
  const tourWantsMenuOpen =
    typeof currentTourTarget === "string" &&
    TOUR_TARGETED_ITEMS.includes(currentTourTarget);

  useEffect(() => {
    if (!tourActive) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(tourWantsMenuOpen);
  }, [tourActive, tourWantsMenuOpen]);

  useEffect(() => {
    if (tourActive) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [tourActive]);

  const swalBase = {
    background: theme === "dark" ? "#1e293b" : "#fff",
    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
    scrollbarPadding: false,
    heightAuto: false,
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: t("reset_cohort_confirm_title"),
      text: t("reset_cohort_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });

    if (result.isConfirmed) {
      resetCohortData();
      toast.success(t("reset_cohort_success_title"), {
        description: t("reset_cohort_success_text"),
      });
    }
  };

  const handleExport = () => {
    const data = exportGrades();
    const cohort = getEspCohortById(data.cohortId);
    const sanitizedLabel = cohort
      ? `esp-cohort-${cohort.ordinal}-${cohort.year}`.toLowerCase()
      : "unknown";
    const fileName = `jala-gpa-grades-${sanitizedLabel}.json`;

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      let parsed: unknown;

      try {
        parsed = JSON.parse(ev.target?.result as string);
      } catch {
        toast.error(t("import_error"), {
          description: t("import_error_invalid_json"),
        });
        return;
      }

      const result = validateEspImportPayload(parsed);

      if (!result.valid) {
        const description =
          result.error.code === "unknown_cohort"
            ? t("import_error_unknown_cohort", {
                cohortId: result.error.cohortId,
              })
            : result.error.code === "invalid_grades"
              ? t("import_error_invalid_grades")
              : t("import_error_missing_fields");

        toast.error(t("import_error"), { description });
        return;
      }

      const { data } = result;

      const confirmed = await Swal.fire({
        title: t("import_confirm_title"),
        text: t("import_confirm_text", { cohortId: data.cohortId }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirm"),
        cancelButtonText: t("cancel"),
        ...swalBase,
      });

      if (confirmed.isConfirmed) {
        importGrades(data);
        toast.success(t("import_success"), {
          description: t("import_success_text", { cohortId: data.cohortId }),
        });
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("actions_menu")}
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
          "border border-border-base bg-bg-surface text-text-secondary",
          "hover:text-text-primary hover:border-border-accent transition-colors duration-200",
        )}
      >
        <Menu size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute right-0 top-11 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-64",
            )}
          >
            <button
              data-tour="action-import"
              onClick={() => {
                setOpen(false);
                inputRef.current?.click();
              }}
              className={cn(
                menuItemClass,
                "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Download size={15} className="shrink-0" />
              {t("import")}
            </button>

            <button
              data-tour="action-export"
              onClick={() => {
                setOpen(false);
                handleExport();
              }}
              className={cn(
                menuItemClass,
                "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Upload size={15} className="shrink-0" />
              {t("export")}
            </button>

            <div className="h-px bg-border-base my-1" />

            <button
              data-tour="action-reset"
              onClick={() => {
                setOpen(false);
                handleReset();
              }}
              className={cn(
                menuItemClass,
                "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
              )}
            >
              <RotateCcw size={15} className="shrink-0" />
              {t("reset")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
