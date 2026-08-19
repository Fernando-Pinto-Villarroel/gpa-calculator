"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Download, Upload, FileText, FlaskConical, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "@/core/lib/i18n/navigation";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { useTourSteps } from "@/features/tour/hooks/useTourSteps";
import { cn } from "@/core/lib/utils/cn";
import { getEspCohortById } from "@/features/gpa/data/esp";
import { splitImportPayload } from "@/features/config/lib/splitImportPayload";
import { parsePdfFile, parseEspPdfFile } from "@/features/config/services/pdfParser";
import Swal from "sweetalert2";

const TOUR_TARGETED_ITEMS = [
  '[data-tour="action-import"]',
  '[data-tour="action-export"]',
  '[data-tour="action-pdf"]',
  '[data-tour="action-reset"]',
];

export function EspActionsMenu({ className }: { className?: string }) {
  const t = useTranslations("config");
  const router = useRouter();
  const { grades, importGrades, exportGrades, resetCohortData, selectedCohortId } =
    useEspGpaStore();
  const {
    grades: commercialGrades,
    importGrades: importCommercialGrades,
    selectedCohortId: commercialSelectedCohortId,
  } = useGpaStore();
  const { theme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
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

      const result = splitImportPayload(parsed);

      if (!result.valid) {
        const description =
          result.error.code === "unknown_cohort"
            ? t("import_error_unknown_cohort", {
                cohortId: result.error.cohortId,
              })
            : result.error.code === "invalid_grades"
              ? t("import_error_invalid_grades")
              : result.error.code === "no_matching_courses"
                ? t("import_error_no_matching_courses")
                : t("import_error_missing_fields");

        toast.error(t("import_error"), { description });
        return;
      }

      const { data } = result;
      const scope =
        data.commercialGrades && data.espGrades
          ? "both"
          : data.espGrades
            ? "esp"
            : "commercial";

      const confirmed = await Swal.fire({
        title: t("import_confirm_title"),
        text: t(`import_confirm_text_${scope}`, { cohortId: data.cohortId }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirm"),
        cancelButtonText: t("cancel"),
        ...swalBase,
      });

      if (confirmed.isConfirmed) {
        if (data.espGrades) {
          importGrades({ cohortId: data.cohortId, grades: data.espGrades });
        }
        if (data.commercialGrades) {
          importCommercialGrades({ cohortId: data.cohortId, grades: data.commercialGrades });
        }
        toast.success(t("import_success"), {
          description: t(`import_success_text_${scope}`, { cohortId: data.cohortId }),
        });
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isPdf =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf";
    if (!isPdf) {
      toast.error(t("pdf_error"), { description: t("pdf_error_not_pdf") });
      return;
    }

    setPdfLoading(true);

    try {
      const [espResult, commercialResult] = await Promise.all([
        parseEspPdfFile(file, selectedCohortId),
        parsePdfFile(file, commercialSelectedCohortId),
      ]);

      if (!espResult.success && !commercialResult.success) {
        const description =
          espResult.error === "no_courses_found"
            ? t("pdf_error_no_courses")
            : t("pdf_error_parse");
        toast.error(t("pdf_error"), { description });
        return;
      }

      const espMatched = espResult.success ? espResult.matched : 0;
      const commercialMatched = commercialResult.success ? commercialResult.matched : 0;

      const cohort = getEspCohortById(selectedCohortId);
      const cohortLabel = cohort
        ? `${cohort.ordinal} - ${cohort.year}`
        : selectedCohortId;

      const commercialText =
        commercialMatched > 0
          ? `<p style="font-size: 0.85em; color: #10b981; margin-top: 8px">${t("pdf_commercial_matched", { matched: String(commercialMatched) })}</p>`
          : "";

      const confirmed = await Swal.fire({
        title: t("pdf_confirm_title"),
        html: `
          <p style="margin-bottom: 8px">${t("pdf_confirm_text", { matched: String(espMatched), cohort: cohortLabel })}</p>
          ${commercialText}
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("pdf_confirm_button"),
        cancelButtonText: t("cancel"),
        ...swalBase,
      });

      if (confirmed.isConfirmed) {
        if (espResult.success && espMatched > 0) {
          importGrades({
            cohortId: selectedCohortId,
            grades: { ...grades, ...espResult.grades },
          });
        }
        if (commercialResult.success && commercialMatched > 0) {
          importCommercialGrades({
            cohortId: commercialSelectedCohortId,
            grades: { ...commercialGrades, ...commercialResult.grades },
          });
        }
        toast.success(t("pdf_success"), {
          description: t("pdf_success_text", {
            matched: String(espMatched + commercialMatched),
          }),
        });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      toast.error(t("pdf_error"), {
        description: `${t("pdf_error_parse")} [${detail}]`,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCanvasPlayground = () => {
    setOpen(false);
    router.push("/grades/playground");
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
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePdfImport}
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

            <button
              data-tour="action-pdf"
              onClick={() => {
                setOpen(false);
                pdfInputRef.current?.click();
              }}
              disabled={pdfLoading}
              className={cn(
                menuItemClass,
                "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
              )}
            >
              {pdfLoading ? (
                <Loader2 size={15} className="animate-spin shrink-0" />
              ) : (
                <FileText size={15} className="shrink-0" />
              )}
              {t("pdf_import")}
            </button>

            <button
              onClick={handleCanvasPlayground}
              className={cn(
                menuItemClass,
                "text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20",
              )}
            >
              <FlaskConical size={15} className="shrink-0" />
              {t("canvas_playground")}
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
