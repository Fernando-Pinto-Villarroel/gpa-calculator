"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Menu, RotateCcw, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { usePlaygroundStore } from "../store/usePlaygroundStore";
import { validatePlaygroundImport } from "../lib/validatePlaygroundImport";
import { parseCanvasPdfFile } from "../services/canvasPdfParser";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { useTourStore } from "@/features/tour/store/useTourStore";
import { useTourSteps } from "@/features/tour/hooks/useTourSteps";
import { cn } from "@/core/lib/utils/cn";

const TOUR_TARGETED_ITEMS = [
  '[data-tour="playground-action-import-backup"]',
  '[data-tour="playground-action-export-backup"]',
  '[data-tour="playground-action-import-canvas"]',
  '[data-tour="playground-action-reset"]',
];

export function PlaygroundActionsMenu({ className }: { className?: string }) {
  const t = useTranslations("playground");
  const { course, setCourse, resetAssignments } = usePlaygroundStore();
  const { theme } = useThemeStore();

  const [open, setOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  if (!course) return null;

  const swalBase = {
    background: theme === "dark" ? "#1e293b" : "#fff",
    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
    scrollbarPadding: false,
    heightAuto: false,
  };

  const handleExportBackup = () => {
    const payload = { version: 1, course };
    const slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const fileName = `jala-canvas-playground-${slug || "course"}.json`;

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(ev.target?.result as string);
      } catch {
        toast.error(t("backup_import_error_title"), {
          description: t("backup_import_error_text"),
        });
        return;
      }

      const result = validatePlaygroundImport(parsed);
      if (!result.valid) {
        toast.error(t("backup_import_error_title"), {
          description: t("backup_import_error_text"),
        });
        return;
      }

      const confirmed = await Swal.fire({
        title: t("backup_import_confirm_title"),
        text: t("backup_import_confirm_text"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("confirm"),
        cancelButtonText: t("cancel"),
        ...swalBase,
      });

      if (confirmed.isConfirmed) {
        setCourse(result.data.course);
        toast.success(t("backup_import_success_title"), {
          description: t("backup_import_success_text"),
        });
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) {
      toast.error(t("canvas_import_error_title"), {
        description: t("canvas_import_error_not_pdf"),
      });
      return;
    }

    setPdfLoading(true);

    try {
      const result = await parseCanvasPdfFile(file, t("default_title"));

      if (!result.success) {
        toast.error(t("canvas_import_error_title"), {
          description: t("canvas_import_error_no_data"),
        });
        return;
      }

      const { title, groups, assignments, weightsWereDerived, hasAlignmentWarning } = result;

      let noticeHtml = "";
      if (weightsWereDerived) {
        noticeHtml += `<p style="font-size: 0.85em; color: #8b5cf6; margin-top: 8px">${t("canvas_import_weights_derived_notice")}</p>`;
      }
      if (hasAlignmentWarning) {
        noticeHtml += `<p style="font-size: 0.85em; color: #f59e0b; margin-top: 8px">${t("canvas_import_alignment_warning")}</p>`;
      }

      const confirmed = await Swal.fire({
        title: t("canvas_import_confirm_title"),
        html: `
          <p style="margin-bottom: 8px">${t("canvas_import_confirm_text", {
            groups: String(groups.length),
            assignments: String(assignments.length),
            title,
          })}</p>
          ${noticeHtml}
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: t("canvas_import_button_confirm"),
        cancelButtonText: t("cancel"),
        ...swalBase,
      });

      if (confirmed.isConfirmed) {
        const groupIdByName = new Map(groups.map((g) => [g.name, `group-${crypto.randomUUID()}`]));

        setCourse({
          title,
          groups: groups.map((g) => ({
            id: groupIdByName.get(g.name) as string,
            name: g.name,
            weightPercent: g.weightPercent,
          })),
          assignments: assignments.map((a) => ({
            id: `assignment-${crypto.randomUUID()}`,
            groupId: groupIdByName.get(a.groupName) ?? "",
            name: a.name,
            score: a.score,
            maxPoints: a.maxPoints,
            tooltipKey: a.isProfessionalism ? ("professionalism" as const) : undefined,
          })),
        });

        toast.success(t("canvas_import_success_title"), {
          description: t("canvas_import_success_text", {
            title,
            assignments: String(assignments.length),
          }),
        });
      }
    } catch {
      toast.error(t("canvas_import_error_title"), {
        description: t("canvas_import_error_parse"),
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: t("reset_assignments_confirm_title"),
      text: t("reset_assignments_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });

    if (result.isConfirmed) resetAssignments(t);
  };

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <input
        ref={backupInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleBackupFileChange}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePdfFileChange}
      />

      <motion.button
        data-tour="playground-actions-menu"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("actions_menu")}
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
          "border border-border-base bg-bg-surface text-text-secondary",
          "hover:text-text-primary hover:border-border-accent transition-colors duration-200",
        )}
      >
        <Menu size={14} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className={cn(
              "absolute right-0 top-10 rounded-xl border border-border-base bg-bg-surface shadow-xl z-30",
              "overflow-hidden min-w-64",
            )}
          >
            <button
              data-tour="playground-action-import-backup"
              onClick={() => {
                setOpen(false);
                backupInputRef.current?.click();
              }}
              className={cn(
                menuItemClass,
                "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Download size={15} className="shrink-0" />
              {t("import_playground_backup")}
            </button>

            <button
              data-tour="playground-action-export-backup"
              onClick={() => {
                setOpen(false);
                handleExportBackup();
              }}
              className={cn(
                menuItemClass,
                "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <Upload size={15} className="shrink-0" />
              {t("export_playground_backup")}
            </button>

            <button
              data-tour="playground-action-import-canvas"
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
              <FileText size={15} className="shrink-0" />
              {t("import_canvas_course")}
            </button>

            <div className="h-px bg-border-base my-1" />

            <button
              data-tour="playground-action-reset"
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
              {t("reset_assignments")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
