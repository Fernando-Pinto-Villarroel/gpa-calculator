import { Step } from "react-joyride";
import { useTranslations } from "next-intl";

export interface TourStep extends Step {
  route: string;
}

export function useTourSteps(): TourStep[] {
  const t = useTranslations("tour");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMobileDashboard =
    typeof window !== "undefined" && window.innerWidth < 1024;

  return [
    {
      route: "",
      target: "body",
      placement: "center",
      title: t("welcome_title"),
      content: t("welcome_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="navbar-brand"]',
      placement: "bottom",
      title: t("navbar_brand_title"),
      content: t("navbar_brand_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: isMobile
        ? '[data-tour="bottom-nav"]'
        : '[data-tour="navbar-links"]',
      placement: isMobile ? "top" : "bottom",
      title: t("navbar_links_title"),
      content: t("navbar_links_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="navbar-language"]',
      placement: "bottom",
      title: t("navbar_language_title"),
      content: t("navbar_language_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="navbar-theme"]',
      placement: "bottom",
      title: t("navbar_theme_title"),
      content: t("navbar_theme_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: isMobileDashboard
        ? '[data-tour="gpa-display-m"]'
        : '[data-tour="gpa-display"]',
      placement: "auto",
      title: t("dashboard_gpa_title"),
      content: t("dashboard_gpa_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: isMobileDashboard
        ? '[data-tour="honor-badge-m"]'
        : '[data-tour="honor-badge"]',
      placement: "auto",
      title: t("dashboard_honor_title"),
      content: t("dashboard_honor_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: isMobileDashboard
        ? '[data-tour="stat-cards-m"]'
        : '[data-tour="stat-cards"]',
      placement: "auto",
      title: t("dashboard_stats_title"),
      content: t("dashboard_stats_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: '[data-tour="config-toolbar"]',
      placement: "bottom",
      title: t("config_toolbar_title"),
      content: t("config_toolbar_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: '[data-tour="cohort-selector"]',
      placement: "bottom",
      title: t("config_cohort_title"),
      content: t("config_cohort_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: '[data-tour="term-selector"]',
      placement: "bottom",
      title: t("config_term_title"),
      content: t("config_term_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: isMobile
        ? '[data-tour="first-course-card-m"]'
        : '[data-tour="first-course-card"]',
      placement: "auto",
      title: t("config_course_card_title"),
      content: t("config_course_card_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: isMobile
        ? '[data-tour="first-credits-badge-m"]'
        : '[data-tour="first-credits-badge"]',
      placement: "auto",
      title: t("config_credits_title"),
      content: t("config_credits_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: isMobile
        ? '[data-tour="first-retake-btn-m"]'
        : '[data-tour="first-retake-btn"]',
      placement: "auto",
      title: t("config_retake_title"),
      content: t("config_retake_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: '[data-tour="pdf-upload"]',
      placement: "auto",
      title: t("config_pdf_upload_title"),
      content: t("config_pdf_upload_content"),
      disableBeacon: true,
    },
    {
      route: "/config",
      target: '[data-tour="import-export"]',
      placement: "auto",
      title: t("config_import_export_title"),
      content: t("config_import_export_content"),
      disableBeacon: true,
    },
    {
      route: "/statistics",
      target: isMobileDashboard ? "body" : '[data-tour="stats-overview"]',
      placement: isMobileDashboard ? "center" : "auto",
      title: t("statistics_overview_title"),
      content: t("statistics_overview_content"),
      disableBeacon: true,
    },
    {
      route: "/statistics",
      target: isMobileDashboard ? "body" : '[data-tour="stats-charts"]',
      placement: isMobileDashboard ? "center" : "top",
      title: t("statistics_charts_title"),
      content: t("statistics_charts_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: '[data-tour="forecast-scope"]',
      placement: "bottom",
      title: t("forecast_scope_title"),
      content: t("forecast_scope_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: '[data-tour="forecast-target"]',
      placement: "bottom",
      title: t("forecast_target_title"),
      content: t("forecast_target_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: isMobileDashboard ? "body" : '[data-tour="forecast-scenarios"]',
      placement: isMobileDashboard ? "center" : "top",
      title: t("forecast_scenarios_title"),
      content: t("forecast_scenarios_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: isMobileDashboard
        ? "body"
        : '[data-tour="forecast-combinations"]',
      placement: isMobileDashboard ? "center" : "top",
      title: t("forecast_combinations_title"),
      content: t("forecast_combinations_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: '[data-tour="forecast-config"]',
      placement: "bottom",
      title: t("forecast_config_title"),
      content: t("forecast_config_content"),
      disableBeacon: true,
    },
    {
      route: "/forecast",
      target: "body",
      placement: "center",
      title: t("done_title"),
      content: t("done_content"),
      disableBeacon: true,
    },
  ];
}
