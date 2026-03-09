"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const ForecastPanel = dynamic(
  () =>
    import("@/features/forecast/components/ForecastPanel").then(
      (m) => m.ForecastPanel,
    ),
  { ssr: false },
);

export default function ForecastPage() {
  const t = useTranslations("forecast");

  return (
    <div className="flex flex-col min-h-full gap-4 px-4 md:px-6 py-5 pb-24 md:pb-8">
      <div>
        <h1 className="text-lg font-bold text-text-primary">{t("title")}</h1>
        <p className="text-xs text-text-muted mt-0.5">{t("subtitle")}</p>
      </div>
      <ForecastPanel />
    </div>
  );
}
