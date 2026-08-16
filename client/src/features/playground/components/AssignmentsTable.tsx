"use client";

import { Plus } from "lucide-react";
import { Reorder } from "framer-motion";
import { useTranslations } from "next-intl";
import { usePlaygroundStore } from "../store/usePlaygroundStore";
import { PlaygroundAssignment } from "../types";
import { AssignmentRow } from "./AssignmentRow";
import { PlaygroundActionsMenu } from "./PlaygroundActionsMenu";
import { cn } from "@/core/lib/utils/cn";

export function AssignmentsTable() {
  const t = useTranslations("playground");
  const { course, addAssignment, reorderAssignments } = usePlaygroundStore();

  if (!course) return null;

  const handleAdd = () => {
    const firstGroup = course.groups[0];
    addAssignment({
      groupId: firstGroup ? firstGroup.id : "",
      name: t("assignment_name_placeholder"),
      score: null,
      maxPoints: null,
    });
  };

  const handleReorder = (newOrder: PlaygroundAssignment[]) => {
    reorderAssignments(newOrder);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-semibold text-text-accent uppercase tracking-wider">
          {t("assignments_title")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            data-tour="playground-add-assignment"
            onClick={handleAdd}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold",
              "border border-border-accent bg-jala-700/10 text-text-accent",
              "hover:bg-jala-700/15 transition-colors duration-200",
            )}
          >
            <Plus size={13} />
            {t("add_assignment")}
          </button>
          <PlaygroundActionsMenu />
        </div>
      </div>

      <Reorder.Group
        as="div"
        axis="y"
        values={course.assignments}
        onReorder={handleReorder}
        className="flex flex-col gap-2"
      >
        {course.assignments.map((assignment, i) => (
          <AssignmentRow
            key={assignment.id}
            assignment={assignment}
            groups={course.groups}
            tourIds={
              i === 0
                ? {
                    row: "playground-first-assignment",
                    dragHandle: "playground-drag-handle",
                    groupSelect: "playground-group-select",
                    scoreBtn: "playground-score-btn",
                    deleteBtn: "playground-delete-assignment",
                  }
                : undefined
            }
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
