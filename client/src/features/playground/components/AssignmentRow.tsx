"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { Reorder, useDragControls, motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePlaygroundStore } from "../store/usePlaygroundStore";
import { PlaygroundAssignment, PlaygroundAssignmentGroup } from "../types";
import { cn } from "@/core/lib/utils/cn";
import { InfoTooltip } from "@/shared/components/ui/InfoTooltip";

interface AssignmentRowTourIds {
  row?: string;
  dragHandle?: string;
  groupSelect?: string;
  scoreBtn?: string;
  deleteBtn?: string;
}

interface AssignmentRowProps {
  assignment: PlaygroundAssignment;
  groups: PlaygroundAssignmentGroup[];
  tourIds?: AssignmentRowTourIds;
}

export function AssignmentRow({ assignment, groups, tourIds }: AssignmentRowProps) {
  const t = useTranslations("playground");
  const { updateAssignment, removeAssignment } = usePlaygroundStore();
  const dragControls = useDragControls();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [editingScore, setEditingScore] = useState(false);
  const [scoreInput, setScoreInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const scoreInputRef = useRef<HTMLInputElement>(null);
  const groupMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!groupMenuOpen) return;
    function handler(e: MouseEvent) {
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target as Node)) {
        setGroupMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [groupMenuOpen]);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingScore) {
      scoreInputRef.current?.focus();
      scoreInputRef.current?.select();
    }
  }, [editingScore]);

  const startEditingName = () => {
    setNameInput(assignment.name);
    setEditingName(true);
  };

  const saveName = () => {
    const trimmed = nameInput.trim();
    updateAssignment(assignment.id, { name: trimmed || assignment.name });
    setEditingName(false);
  };

  const startEditingScore = () => {
    setScoreInput(assignment.score !== null ? String(assignment.score) : "0");
    setMaxInput(assignment.maxPoints !== null ? String(assignment.maxPoints) : "0");
    setEditingScore(true);
  };

  const clampNonNegative = (value: string) => {
    if (value.trim() === "" || value === "-") return value;
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return num < 0 ? "0" : value;
  };

  const saveScore = () => {
    const parsedScore = scoreInput.trim() === "" ? 0 : Math.max(0, Number(scoreInput));
    const parsedMax = maxInput.trim() === "" ? 0 : Math.max(0, Number(maxInput));
    updateAssignment(assignment.id, {
      score: !Number.isNaN(parsedScore) ? parsedScore : 0,
      maxPoints: !Number.isNaN(parsedMax) ? parsedMax : 0,
    });
    setEditingScore(false);
  };

  const isGraded = assignment.score !== null && assignment.maxPoints !== null;
  const groupExists = groups.some((g) => g.id === assignment.groupId);
  const selectedGroup = groups.find((g) => g.id === assignment.groupId);
  const groupLabel = groupExists ? selectedGroup?.name : t("no_group");
  const tooltipText =
    assignment.tooltipKey === "professionalism" ? t("professionalism_tooltip") : undefined;

  return (
    <Reorder.Item
      value={assignment}
      dragListener={false}
      dragControls={dragControls}
      as="div"
      data-tour={tourIds?.row}
      whileDrag={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.18)", zIndex: 10 }}
      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border-base bg-bg-surface relative"
    >
      <button
        type="button"
        data-tour={tourIds?.dragHandle}
        onPointerDown={(e) => dragControls.start(e)}
        title={t("drag_handle")}
        aria-label={t("drag_handle")}
        className="shrink-0 text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing touch-none p-1 -ml-1"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        {editingName ? (
          <input
            ref={nameInputRef}
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveName();
              if (e.key === "Escape") setEditingName(false);
            }}
            maxLength={300}
            className="w-full text-sm font-medium bg-transparent border-b border-border-accent focus:outline-none text-text-primary"
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <p
              onDoubleClick={startEditingName}
              title={t("title_hint")}
              className="text-sm font-medium text-text-primary truncate cursor-text"
            >
              {assignment.name}
            </p>
            {tooltipText && <InfoTooltip text={tooltipText} />}
          </div>
        )}

        <div
          ref={groupMenuRef}
          data-tour={tourIds?.groupSelect}
          className="relative mt-1 -ml-0.5 inline-flex max-w-full items-center"
        >
          <button
            type="button"
            data-testid="playground-group-trigger"
            onClick={() => setGroupMenuOpen((v) => !v)}
            className="max-w-full truncate pl-4 py-0.5 text-[11px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            {groupLabel}
          </button>
          <ChevronDown
            size={11}
            className="absolute left-0 pointer-events-none text-text-muted"
          />

          <AnimatePresence>
            {groupMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.12 }}
                data-testid="playground-group-menu"
                className="absolute left-0 top-full mt-1 z-20 min-w-40 max-w-56 rounded-lg border border-border-base bg-bg-surface shadow-xl overflow-hidden"
              >
                {groups.map((group) => {
                  const active = group.id === assignment.groupId;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        updateAssignment(assignment.id, { groupId: group.id });
                        setGroupMenuOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-xs transition-colors truncate",
                        active
                          ? "bg-jala-700/15 text-text-accent font-medium"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                      )}
                    >
                      {group.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0">
        {editingScore ? (
          <div className="flex items-center gap-1">
            <input
              ref={scoreInputRef}
              type="number"
              min={0}
              value={scoreInput}
              onChange={(e) => setScoreInput(clampNonNegative(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveScore();
                if (e.key === "Escape") setEditingScore(false);
              }}
              aria-label={t("score_placeholder")}
              className="w-14 text-sm text-right px-1.5 py-1 rounded border border-border-accent bg-bg-surface text-text-primary focus:outline-none"
            />
            <span className="text-text-muted text-sm">/</span>
            <input
              type="number"
              min={0}
              value={maxInput}
              onChange={(e) => setMaxInput(clampNonNegative(e.target.value))}
              onBlur={saveScore}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveScore();
                if (e.key === "Escape") setEditingScore(false);
              }}
              aria-label={t("max_points_placeholder")}
              className="w-14 text-sm text-right px-1.5 py-1 rounded border border-border-accent bg-bg-surface text-text-primary focus:outline-none"
            />
          </div>
        ) : (
          <button
            data-tour={tourIds?.scoreBtn}
            onClick={startEditingScore}
            title={t("score_max_hint")}
            className={cn(
              "px-2.5 py-1 rounded-md text-sm font-semibold tabular-nums min-w-16 text-center transition-colors",
              isGraded
                ? "text-text-primary bg-bg-elevated hover:border-border-accent border border-transparent"
                : "text-text-muted bg-bg-elevated/50 border border-dashed border-border-strong hover:border-border-accent",
            )}
          >
            {isGraded ? `${assignment.score} / ${assignment.maxPoints}` : t("ungraded")}
          </button>
        )}
      </div>

      <button
        data-tour={tourIds?.deleteBtn}
        onClick={() => removeAssignment(assignment.id)}
        title={t("remove_assignment")}
        className="shrink-0 text-text-muted hover:text-danger transition-colors p-1"
      >
        <Trash2 size={14} />
      </button>
    </Reorder.Item>
  );
}
