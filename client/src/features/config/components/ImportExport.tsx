"use client";

import { useRef } from "react";
import { Upload, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { LetterGrade } from "@/core/domain/types/letterGrades";
import { cn } from "@/core/lib/utils/cn";

export function ImportExport() {
  const t = useTranslations("config");
  const { importGrades, exportGrades } = useGpaStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportGrades();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
        const data = JSON.parse(ev.target?.result as string) as Record<string, LetterGrade | null>;
        importGrades(data);
      } catch {
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const btnClass = cn(
    "flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium",
    "border border-border-base bg-bg-surface text-text-secondary",
    "hover:text-text-primary hover:border-border-accent transition-colors duration-200"
  );

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <motion.button whileTap={{ scale: 0.95 }} onClick={() => inputRef.current?.click()} className={btnClass}>
        <Upload size={13} />
        {t("import")}
      </motion.button>
      <motion.button whileTap={{ scale: 0.95 }} onClick={handleExport} className={btnClass}>
        <Download size={13} />
        {t("export")}
      </motion.button>
    </div>
  );
}
