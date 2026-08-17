import { Step } from "react-joyride";
import { useTranslations } from "next-intl";
import { useCareerStore } from "@/features/career/store/useCareerStore";

export interface TourStep extends Step {
  route: string;
}

export function useTourSteps(): TourStep[] {
  const t = useTranslations("tour");
  const { selectedCareerId } = useCareerStore();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const isMobileDashboard =
    typeof window !== "undefined" && window.innerWidth < 1024;
  // Matches the custom `nav:` breakpoint (72rem / 1152px) in globals.css
  // that the header uses to switch between nav links and the hamburger menu.
  const isMobileNav = typeof window !== "undefined" && window.innerWidth < 1152;

  const commercialGradesSteps: TourStep[] = [
    {
      route: "/grades",
      target: '[data-tour="config-toolbar"]',
      placement: "bottom",
      title: t("config_toolbar_title"),
      content: t("config_toolbar_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="cohort-selector"]',
      placement: "bottom",
      title: t("config_cohort_title"),
      content: t("config_cohort_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="term-selector"]',
      placement: "bottom",
      title: t("config_term_title"),
      content: t("config_term_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-course-card-m"]'
        : '[data-tour="first-course-card"]',
      placement: "auto",
      title: t("config_course_card_title"),
      content: t("config_course_card_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-credits-badge-m"]'
        : '[data-tour="first-credits-badge"]',
      placement: "auto",
      title: t("config_credits_title"),
      content: t("config_credits_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-retake-btn-m"]'
        : '[data-tour="first-retake-btn"]',
      placement: "auto",
      title: t("config_retake_title"),
      content: t("config_retake_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-import"]',
      placement: "auto",
      title: t("config_action_import_title"),
      content: t("config_action_import_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-export"]',
      placement: "auto",
      title: t("config_action_export_title"),
      content: t("config_action_export_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-pdf"]',
      placement: "auto",
      title: t("config_pdf_upload_title"),
      content: t("config_pdf_upload_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-reset"]',
      placement: "auto",
      title: t("config_action_reset_title"),
      content: t("config_action_reset_content"),
      disableBeacon: true,
    },
  ];

  const espGradesSteps: TourStep[] = [
    {
      route: "/grades",
      target: '[data-tour="config-toolbar"]',
      placement: "bottom",
      title: t("esp_config_toolbar_title"),
      content: t("esp_config_toolbar_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="esp-cohort-selector"]',
      placement: "bottom",
      title: t("esp_config_cohort_title"),
      content: t("esp_config_cohort_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-course-card-m"]'
        : '[data-tour="first-course-card"]',
      placement: "auto",
      title: t("esp_config_course_card_title"),
      content: t("esp_config_course_card_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-credits-badge-m"]'
        : '[data-tour="first-credits-badge"]',
      placement: "auto",
      title: t("config_credits_title"),
      content: t("config_credits_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: isMobile
        ? '[data-tour="first-retake-btn-m"]'
        : '[data-tour="first-retake-btn"]',
      placement: "auto",
      title: t("config_retake_title"),
      content: t("config_retake_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-import"]',
      placement: "auto",
      title: t("config_action_import_title"),
      content: t("config_action_import_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-export"]',
      placement: "auto",
      title: t("config_action_export_title"),
      content: t("config_action_export_content"),
      disableBeacon: true,
    },
    {
      route: "/grades",
      target: '[data-tour="action-reset"]',
      placement: "auto",
      title: t("config_action_reset_title"),
      content: t("config_action_reset_content"),
      disableBeacon: true,
    },
  ];

  const gradesSteps =
    selectedCareerId === "esp" ? espGradesSteps : commercialGradesSteps;

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
      target: isMobileNav
        ? '[data-tour="bottom-nav"]'
        : '[data-tour="navbar-links"]',
      placement: isMobileNav ? "top" : "bottom",
      title: t("navbar_links_title"),
      content: t("navbar_links_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="navbar-career"]',
      placement: "bottom",
      title: t("navbar_career_title"),
      content: t("navbar_career_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="header-language"]',
      placement: "bottom",
      title: t("navbar_language_title"),
      content: t("navbar_language_content"),
      disableBeacon: true,
    },
    {
      route: "",
      target: '[data-tour="header-theme"]',
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
    ...gradesSteps,
    {
      route: "/grades/playground",
      target: "body",
      placement: "center",
      title: t("playground_welcome_title"),
      content: t("playground_welcome_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-back"]',
      placement: "bottom",
      title: t("playground_back_title"),
      content: t("playground_back_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-title"]',
      placement: "bottom",
      title: t("playground_title_title"),
      content: t("playground_title_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-add-assignment"]',
      placement: "auto",
      title: t("playground_add_assignment_title"),
      content: t("playground_add_assignment_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-first-assignment"]',
      placement: "auto",
      title: t("playground_assignment_title"),
      content: t("playground_assignment_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-drag-handle"]',
      placement: "auto",
      title: t("playground_drag_title"),
      content: t("playground_drag_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-group-select"]',
      placement: "auto",
      title: t("playground_group_select_title"),
      content: t("playground_group_select_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-score-btn"]',
      placement: "auto",
      title: t("playground_score_title"),
      content: t("playground_score_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-delete-assignment"]',
      placement: "auto",
      title: t("playground_delete_assignment_title"),
      content: t("playground_delete_assignment_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      // AssignmentGroupsPanel stacks below AssignmentsTable on mobile
      // (flex-col below the `lg:` breakpoint in playground/page.tsx), so
      // with several assignments it can land off-screen. Joyride's tour
      // never auto-scrolls (disableScrolling), so fall back to a centered,
      // targetless step there instead of spotlighting something the user
      // can't see — same pattern used for the /statistics charts step.
      target: isMobileDashboard ? "body" : '[data-tour="playground-total"]',
      placement: isMobileDashboard ? "center" : "auto",
      title: t("playground_total_title"),
      content: t("playground_total_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: isMobileDashboard ? "body" : '[data-tour="playground-groups-table"]',
      placement: isMobileDashboard ? "center" : "auto",
      title: t("playground_groups_table_title"),
      content: t("playground_groups_table_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: isMobileDashboard ? "body" : '[data-tour="playground-groups-actions"]',
      placement: isMobileDashboard ? "center" : "auto",
      title: t("playground_groups_actions_title"),
      content: t("playground_groups_actions_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-actions-menu"]',
      placement: "auto",
      title: t("playground_actions_menu_title"),
      content: t("playground_actions_menu_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-action-import-backup"]',
      placement: "auto",
      title: t("playground_action_import_backup_title"),
      content: t("playground_action_import_backup_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-action-export-backup"]',
      placement: "auto",
      title: t("playground_action_export_backup_title"),
      content: t("playground_action_export_backup_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-action-import-canvas"]',
      placement: "auto",
      title: t("playground_action_import_canvas_title"),
      content: t("playground_action_import_canvas_content"),
      disableBeacon: true,
    },
    {
      route: "/grades/playground",
      target: '[data-tour="playground-action-reset"]',
      placement: "auto",
      title: t("playground_action_reset_title"),
      content: t("playground_action_reset_content"),
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
      target: isMobileDashboard ? "body" : "body",
      // : '[data-tour="forecast-combinations"]',
      placement: isMobileDashboard ? "center" : "center",
      // : "top",
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
