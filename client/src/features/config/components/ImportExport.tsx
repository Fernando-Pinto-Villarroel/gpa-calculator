"use client";

import { useRef } from "react";
import { Upload, Download, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";
import Swal from "sweetalert2";

export function ImportExport() {
  const t = useTranslations("config");
  const { importGrades, exportGrades, resetTermData } = useGpaStore();
  const { theme } = useThemeStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleResetTermData = async () => {
    const result = await Swal.fire({
      title: t("reset_term_confirm_title"),
      text: t("reset_term_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      background: theme === "dark" ? "#1e293b" : "#fff",
      color: theme === "dark" ? "#f1f5f9" : "#0f172a",
    });

    if (result.isConfirmed) {
      resetTermData();
      Swal.fire({
        title: t("reset_term_success_title"),
        text: t("reset_term_success_text"),
        icon: "success",
        background: theme === "dark" ? "#1e293b" : "#fff",
        color: theme === "dark" ? "#f1f5f9" : "#0f172a",
      });
    }
  };

  const handleExport = () => {
    const data = exportGrades();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jala-gpa-grades.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<
          string,
          LetterGrade | null
        >;
        importGrades(data);
      } catch {}
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const btnClass = cn(
    "flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-medium",
    "border border-border-base bg-bg-surface text-text-secondary",
    "hover:text-text-primary hover:border-border-accent transition-colors duration-200",
  );

  const resetBtnClass = cn(
    "flex items-center gap-1.5 px-2 h-8 rounded-lg text-xs font-medium",
    "border border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    "hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-500 transition-colors duration-200",
  );

  return (
    <div className="flex items-center gap-2">
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
        onClick={handleResetTermData}
        className={resetBtnClass}
      >
        <RotateCcw size={13} />
        {t("reset_term")}
      </motion.button>
    </div>
  );
}
