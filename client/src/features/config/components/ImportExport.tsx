"use client";

import { useRef, useState } from "react";
import { Upload, Download, RotateCcw, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { cn } from "@/core/lib/utils/cn";
import { getCohortById } from "@/features/gpa/data";
import { validateImportPayload } from "@/features/config/lib/validateImportPayload";
import { parsePdfFile } from "@/features/config/services/pdfParser";
import Swal from "sweetalert2";

export function ImportExport({ className }: { className?: string }) {
  const t = useTranslations("config");
  const { importGrades, exportGrades, resetTermData, resetCohortData, selectedCohortId } =
    useGpaStore();
  const { theme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const swalBase = {
    background: theme === "dark" ? "#1e293b" : "#fff",
    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
  };

  const handleResetTermData = async () => {
    const result = await Swal.fire({
      title: t("reset_confirm_title"),
      text: t("reset_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });

    if (result.isConfirmed) {
      resetTermData();
      toast.success(t("reset_success_title"), {
        description: t("reset_success_text"),
      });
    }
  };

  const handleResetCohortData = async () => {
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

  const handleReset = async () => {
    const result = await Swal.fire({
      title: t("reset_choose_scope_title"),
      text: t("reset_choose_scope_text"),
      icon: "question",
      showCancelButton: true,
      confirmButtonText: t("reset_term_option"),
      cancelButtonText: t("reset_cohort_option"),
      reverseButtons: true,
      ...swalBase,
    });

    if (result.isConfirmed) {
      await handleResetTermData();
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      await handleResetCohortData();
    }
  };

  const handleExport = () => {
    const data = exportGrades();
    const cohort = getCohortById(data.cohortId);
    const sanitizedLabel = cohort
      ? `cohort-${cohort.ordinal}-${cohort.year}`.toLowerCase()
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

      const result = validateImportPayload(parsed);

      if (!result.valid) {
        const description =
          result.error.code === "unknown_cohort"
            ? t("import_error_unknown_cohort", { cohortId: result.error.cohortId })
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

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error(t("pdf_error"), { description: t("pdf_error_not_pdf") });
      return;
    }

    setPdfLoading(true);

    try {
      const result = await parsePdfFile(file, selectedCohortId);

      if (!result.success) {
        const description =
          result.error === "no_courses_found"
            ? t("pdf_error_no_courses")
            : t("pdf_error_parse");
        toast.error(t("pdf_error"), { description });
        return;
      }

      const { grades, matched, unrecognized, remapped, creditOverrides } = result;

      let warningText = "";
      if (unrecognized.length > 0) {
        warningText = t("pdf_unrecognized_codes", {
          codes: unrecognized.join(", "),
        });
      }

      let remapText = "";
      if (remapped.length > 0) {
        const items = remapped
          .map((r) => `${r.from} → ${r.to}`)
          .join(", ");
        remapText = t("pdf_remapped_codes", { codes: items });
      }

      let creditText = "";
      if (creditOverrides.length > 0) {
        const items = creditOverrides
          .map((c) => `${c.courseCode}: ${c.expected} → ${c.actual}`)
          .join(", ");
        creditText = t("pdf_credit_overrides", { codes: items });
      }

      const cohort = getCohortById(selectedCohortId);
      const cohortLabel = cohort
        ? `${cohort.ordinal} - ${cohort.year}`
        : selectedCohortId;

      const confirmed = await Swal.fire({
        title: t("pdf_confirm_title"),
        html: `
          <p style="margin-bottom: 8px">${t("pdf_confirm_text", { matched: String(matched), cohort: cohortLabel })}</p>
          ${remapText ? `<p style="font-size: 0.85em; color: #3b82f6; margin-top: 8px">${remapText}</p>` : ""}
          ${creditText ? `<p style="font-size: 0.85em; color: #8b5cf6; margin-top: 8px">${creditText}</p>` : ""}
          ${warningText ? `<p style="font-size: 0.85em; color: #f59e0b; margin-top: 8px">${warningText}</p>` : ""}
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
        importGrades({ cohortId: selectedCohortId, grades });
        toast.success(t("pdf_success"), {
          description: t("pdf_success_text", { matched: String(matched) }),
        });
      }
    } catch {
      toast.error(t("pdf_error"), { description: t("pdf_error_parse") });
    } finally {
      setPdfLoading(false);
    }
  };

  const btnClass = cn(
    "flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-medium",
    "border border-border-base bg-bg-surface text-text-secondary",
    "hover:text-text-primary hover:border-border-accent transition-colors duration-200",
    "sm:px-2.5",
  );

  const pdfBtnClass = cn(
    "flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-medium",
    "border border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    "hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-500 transition-colors duration-200",
    "sm:px-2.5",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  );

  const resetBtnClass = cn(
    "flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-medium",
    "border border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    "hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-500 transition-colors duration-200",
    "sm:px-2.5",
  );

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handlePdfImport}
      />
      <motion.button
        data-tour="pdf-upload"
        whileTap={{ scale: 0.95 }}
        onClick={() => pdfInputRef.current?.click()}
        disabled={pdfLoading}
        className={pdfBtnClass}
      >
        {pdfLoading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileText size={13} />
        )}
        {t("pdf_import")}
      </motion.button>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => inputRef.current?.click()}
        className={btnClass}
      >
        <Upload size={13} />
        {t("import")}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleExport}
        className={btnClass}
      >
        <Download size={13} />
        {t("export")}
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        className={resetBtnClass}
      >
        <RotateCcw size={13} />
        {t("reset")}
      </motion.button>
    </div>
  );
}
