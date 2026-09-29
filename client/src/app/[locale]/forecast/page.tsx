"use client";

import { useTranslations } from "next-intl";
import { ForecastPanel } from "@/features/forecast/components/ForecastPanel";
import { useIsClient } from "@/shared/hooks/useIsClient";

export default function ForecastPage() {
  const t = useTranslations("forecast");
  const isClient = useIsClient();

  return (
    <div className="flex flex-col min-h-full gap-4 px-4 md:px-6 py-5 pb-24 md:pb-8">
      <div>
        <h1 className="text-lg font-bold text-text-primary">{t("title")}</h1>
        <p className="text-xs text-text-muted mt-0.5">{t("subtitle")}</p>
      </div>
      {isClient && <ForecastPanel />}
    </div>
  );
}
