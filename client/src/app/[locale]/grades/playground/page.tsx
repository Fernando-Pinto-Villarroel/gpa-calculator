"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePlaygroundStore } from "@/features/playground/store/usePlaygroundStore";
import { PlaygroundHeader } from "@/features/playground/components/PlaygroundHeader";
import { AssignmentsTable } from "@/features/playground/components/AssignmentsTable";
import { AssignmentGroupsPanel } from "@/features/playground/components/AssignmentGroupsPanel";

export default function PlaygroundPage() {
  const t = useTranslations("playground");
  const locale = useLocale();
  const { course, ensureInitialized, syncDefaultLocalization } = usePlaygroundStore();

  useEffect(() => {
    ensureInitialized(t);
    syncDefaultLocalization(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  if (!course) return null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PlaygroundHeader />
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          <div className="flex-1 min-w-0">
            <AssignmentsTable />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <AssignmentGroupsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
