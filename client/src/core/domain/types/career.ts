export type CareerId = "software_engineering_design_architecture" | "esp";

export interface CareerDefinition {
  id: CareerId;
  labelKey: string;
  hasCredits: boolean;
}

export const CAREERS: CareerDefinition[] = [
  {
    id: "software_engineering_design_architecture",
    labelKey: "career_software_engineering_design_architecture",
    hasCredits: true,
  },
  {
    id: "esp",
    labelKey: "career_esp",
    hasCredits: false,
  },
];

export function getCareerById(id: CareerId): CareerDefinition {
  return CAREERS.find((c) => c.id === id) ?? CAREERS[0];
}
