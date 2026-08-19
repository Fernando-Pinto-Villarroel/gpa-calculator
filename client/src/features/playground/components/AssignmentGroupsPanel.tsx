"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { usePlaygroundStore } from "../store/usePlaygroundStore";
import { calculatePlaygroundTotal, sumGroupWeights } from "../services/calculatePlaygroundGrade";
import { useThemeStore } from "@/features/theme/store/useThemeStore";
import { cn } from "@/core/lib/utils/cn";
import { isApproximately } from "@/core/lib/utils/numeric";

const MAX_GROUP_NAME_LINES = 5;

function autoGrowGroupName(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  const styles = getComputedStyle(el);
  const lineHeight = parseFloat(styles.lineHeight) || 16;
  const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const maxHeight = lineHeight * MAX_GROUP_NAME_LINES + paddingY;
  el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
}

export function AssignmentGroupsPanel() {
  const t = useTranslations("playground");
  const { course, addGroup, updateGroup, removeGroup, resetGroups } = usePlaygroundStore();
  const { theme } = useThemeStore();

  if (!course) return null;

  const { totalPercent } = calculatePlaygroundTotal(course.groups, course.assignments);
  const totalWeight = sumGroupWeights(course.groups);
  const weightIsValid = isApproximately(totalWeight, 100);

  const swalBase = {
    background: theme === "dark" ? "#1e293b" : "#fff",
    color: theme === "dark" ? "#f1f5f9" : "#0f172a",
    scrollbarPadding: false,
    heightAuto: false,
  };

  const buttonClass = cn(
    "flex-1 flex items-center justify-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium",
    "border border-border-base bg-bg-surface text-text-secondary",
    "hover:text-text-primary hover:border-border-accent transition-colors duration-200",
  );

  const handleAddGroup = () => {
    addGroup({ name: t("group_name_placeholder"), weightPercent: 0 });
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: t("reset_groups_confirm_title"),
      text: t("reset_groups_confirm_text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("confirm"),
      cancelButtonText: t("cancel"),
      ...swalBase,
    });

    if (result.isConfirmed) resetGroups(t);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        data-tour="playground-total"
        className="flex flex-col items-center gap-1 p-4 rounded-xl border border-border-base bg-bg-elevated/60"
      >
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
          {t("total_label")}
        </span>
        <span className="text-3xl font-bold tabular-nums text-text-accent">
          {totalPercent !== null ? `${totalPercent.toFixed(2)}%` : "—"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-text-muted">{t("weighting_title")}</h3>

        <div
          data-tour="playground-groups-table"
          className="rounded-lg border border-border-base overflow-hidden overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-elevated/60 text-text-muted text-xs">
                <th className="text-left font-medium px-2.5 py-2">{t("group_header_name")}</th>
                <th className="text-right font-medium px-2.5 py-2 w-20">
                  {t("group_header_weight")}
                </th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {course.groups.map((group) => (
                <tr key={group.id} className="border-t border-border-base">
                  <td className="px-1.5 py-1 align-top">
                    <textarea
                      ref={autoGrowGroupName}
                      value={group.name}
                      onChange={(e) => {
                        updateGroup(group.id, { name: e.target.value });
                        autoGrowGroupName(e.target);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          (e.target as HTMLTextAreaElement).blur();
                        }
                      }}
                      placeholder={t("group_name_placeholder")}
                      maxLength={300}
                      rows={1}
                      className="w-full resize-none overflow-y-auto bg-transparent text-text-primary text-xs leading-snug px-1.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-border-accent"
                    />
                  </td>
                  <td className="px-1.5 py-1 align-top">
                    <div className="flex items-center justify-end gap-0.5">
                      <input
                        type="number"
                        value={group.weightPercent}
                        onChange={(e) =>
                          updateGroup(group.id, { weightPercent: Number(e.target.value) || 0 })
                        }
                        className="w-full min-w-0 text-right bg-transparent text-text-primary text-xs px-1.5 py-1 rounded focus:outline-none focus:ring-1 focus:ring-border-accent tabular-nums"
                      />
                      <span className="text-text-muted text-xs shrink-0">%</span>
                    </div>
                  </td>
                  <td className="px-1 py-1 align-top text-center">
                    <button
                      onClick={() => removeGroup(group.id)}
                      title={t("remove_group")}
                      className="text-text-muted hover:text-danger transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-border-base font-semibold">
                <td className="px-2.5 py-2 text-text-primary">{t("group_total_label")}</td>
                <td
                  className={cn(
                    "px-2.5 py-2 text-right tabular-nums",
                    weightIsValid ? "text-text-primary" : "text-danger",
                  )}
                >
                  {Math.round(totalWeight * 100) / 100}%
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {!weightIsValid && <p className="text-xs text-danger">{t("group_total_mismatch")}</p>}

        <div className="flex items-center gap-2">
          <button
            data-tour="playground-groups-actions"
            onClick={handleAddGroup}
            className={buttonClass}
          >
            <Plus size={13} />
            {t("add_group")}
          </button>
          <button onClick={handleReset} className={buttonClass}>
            <RotateCcw size={13} />
            {t("reset_groups")}
          </button>
        </div>
      </div>
    </div>
  );
}
