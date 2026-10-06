"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { useGpaStore } from "@/features/gpa/store/useGpaStore";
import { useEspGpaStore } from "@/features/gpa/store/useEspGpaStore";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { getCohortById } from "@/features/gpa/data/software-engineering-design-architecture";
import { getEspCohortById, getEspTermsByCohortId } from "@/features/gpa/data/esp";
import { extractTextFromPdf } from "@/core/lib/pdf/extractTextFromPdf";
import { hasReadableText, parseSisText } from "@/features/config/services/pdfParser";
import {
  EspPlacementLevel,
  getPlacementLevelForImport,
  resolveEspPlacementLevel,
} from "@/features/esp/lib/placement";

export type SisImportPrimary = "commercial" | "esp";
type SisSource = "pdf" | "text";

export function useSisImport(primary: SisImportPrimary) {
  const t = useTranslations("config");
  const theme = useThemeStore((state) => state.theme);
  const [loading, setLoading] = useState(false);

  const swalBase = {
    background: theme === "dark" ? "#1e293b" : "#fff",
    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
    scrollbarPadding: false,
    heightAuto: false,
  };

  const processText = async (rawText: string, source: SisSource) => {
    const commercialState = useGpaStore.getState();
    const espState = useEspGpaStore.getState();
    const commercialCohortId = commercialState.selectedCohortId;
    const espCohortId = espState.selectedCohortId;

    const { commercial, esp } = parseSisText(rawText, commercialCohortId, espCohortId);
    const errorTitle = source === "pdf" ? t("pdf_error") : t("paste_error");

    if (!commercial.success && !esp.success) {
      const primaryResult = primary === "commercial" ? commercial : esp;
      const description =
        source === "text"
          ? t("paste_error_no_courses")
          : !primaryResult.success && primaryResult.error === "no_courses_found"
            ? t("pdf_error_no_courses")
            : t("pdf_error_parse");
      toast.error(errorTitle, { description });
      return;
    }

    const commercialMatched = commercial.success ? commercial.matched : 0;
    const espMatched = esp.success ? esp.matched : 0;
    const primaryMatched = primary === "commercial" ? commercialMatched : espMatched;

    const primaryCohortId = primary === "commercial" ? commercialCohortId : espCohortId;
    const cohort =
      primary === "commercial" ? getCohortById(primaryCohortId) : getEspCohortById(primaryCohortId);
    const cohortLabel = cohort ? `${cohort.ordinal} - ${cohort.year}` : primaryCohortId;

    const note = (text: string) =>
      `<p style="font-size: 0.85em; color: #10b981; margin-top: 8px">${text}</p>`;
    const secondaryNote =
      primary === "commercial"
        ? espMatched > 0
          ? note(t("pdf_esp_matched", { matched: String(espMatched) }))
          : ""
        : commercialMatched > 0
          ? note(t("pdf_commercial_matched", { matched: String(commercialMatched) }))
          : "";

    let commercialWarnings = "";
    if (primary === "commercial" && commercial.success) {
      if (commercial.remapped.length > 0) {
        const items = commercial.remapped.map((r) => `${r.from} → ${r.to}`).join(", ");
        commercialWarnings += `<p style="font-size: 0.85em; color: #3b82f6; margin-top: 8px">${t("pdf_remapped_codes", { codes: items })}</p>`;
      }
      if (commercial.creditOverrides.length > 0) {
        const items = commercial.creditOverrides
          .map((c) => `${c.courseCode}: ${c.expected} → ${c.actual}`)
          .join(", ");
        commercialWarnings += `<p style="font-size: 0.85em; color: #8b5cf6; margin-top: 8px">${t("pdf_credit_overrides", { codes: items })}</p>`;
      }
      if (commercial.unrecognized.length > 0) {
        commercialWarnings += `<p style="font-size: 0.85em; color: #f59e0b; margin-top: 8px">${t("pdf_unrecognized_codes", { codes: commercial.unrecognized.join(", ") })}</p>`;
      }
    }

    const confirmed = await Swal.fire({
      title: t("pdf_confirm_title"),
      html: `
        <p style="margin-bottom: 8px">${t("pdf_confirm_text", { matched: String(primaryMatched), cohort: cohortLabel })}</p>
        ${secondaryNote}
        ${commercialWarnings}
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("pdf_confirm_button"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });

    if (!confirmed.isConfirmed) return;

    let placementChangedTo: EspPlacementLevel | undefined;
    if (commercial.success && commercialMatched > 0) {
      commercialState.importGrades({ cohortId: commercialCohortId, grades: commercial.grades });
    }
    if (esp.success && espMatched > 0) {
      const espTerms = getEspTermsByCohortId(espCohortId);
      const placement = getPlacementLevelForImport(
        esp.grades,
        espTerms,
        resolveEspPlacementLevel(espState.grades, espTerms, espState.placementLevel),
      );
      placementChangedTo = placement.changed ? (placement.level ?? undefined) : undefined;
      espState.importGrades({
        cohortId: espCohortId,
        grades: esp.grades,
        placementLevel: placement.level,
      });
    }

    const successText = t("pdf_success_text", {
      matched: String(commercialMatched + espMatched),
    });
    toast.success(t("pdf_success"), {
      description: placementChangedTo
        ? `${successText} ${t("pdf_placement_level_adjusted", { level: placementChangedTo })}`
        : successText,
    });
  };

  const run = async (source: SisSource, readText: () => Promise<string | null>) => {
    setLoading(true);
    try {
      const rawText = await readText();
      if (rawText !== null) await processText(rawText, source);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      toast.error(source === "pdf" ? t("pdf_error") : t("paste_error"), {
        description: `${t("pdf_error_parse")} [${detail}]`,
      });
    } finally {
      setLoading(false);
    }
  };

  const importFromPdf = async (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!isPdf) {
      toast.error(t("pdf_error"), { description: t("pdf_error_not_pdf") });
      return;
    }
    await run("pdf", async () => {
      const text = await extractTextFromPdf(file);
      if (!hasReadableText(text)) {
        toast.error(t("pdf_error"), { description: t("pdf_error_no_text") });
        return null;
      }
      return text;
    });
  };

  const importFromText = async (text: string) => {
    await run("text", async () => {
      if (text.trim().length === 0) {
        toast.error(t("paste_error"), { description: t("paste_error_no_courses") });
        return null;
      }
      return text;
    });
  };

  const askPastedText = async () => {
    const result = await Swal.fire({
      title: t("sis_paste_title"),
      input: "textarea",
      inputPlaceholder: t("sis_paste_placeholder"),
      inputAttributes: { "aria-label": t("sis_paste_placeholder"), rows: "8" },
      inputValidator: (value) => (value.trim().length > 0 ? null : t("sis_paste_empty")),
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("sis_paste_confirm"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });
    if (result.isConfirmed && typeof result.value === "string") {
      await importFromText(result.value);
    }
  };

  const openSourcePicker = async (openPdfDialog: () => void) => {
    const choice = await Swal.fire({
      title: t("sis_source_title"),
      html: `
        <div style="text-align: left; font-size: 0.9em">
          <p style="margin-bottom: 10px">${t("sis_source_intro")}</p>
          <p style="margin-bottom: 10px">${t("sis_source_pdf_steps")}</p>
          <p>${t("sis_source_paste_steps")}</p>
        </div>
      `,
      icon: "info",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      denyButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("sis_source_pdf"),
      denyButtonText: t("sis_source_paste"),
      cancelButtonText: t("cancel"),
      preConfirm: () => {
        openPdfDialog();
        return true;
      },
      ...swalBase,
    });
    if (choice.isDenied) await askPastedText();
  };

  return { loading, importFromPdf, openSourcePicker };
}
