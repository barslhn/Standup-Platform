export const TEAM_OPTIONS = [
  { value: "FULL_STACK_DEVELOPER", label: "Full Stack Developer" },
  { value: "UI_UX", label: "UI/UX" },
  { value: "MOBILE", label: "Mobile" },
] as const;

export const TEAM_OPTIONS_FILTER = [
  { value: "ALL_TEAMS", label: "Tüm Takımlar" },
  ...TEAM_OPTIONS,
] as const;

export const ROLE_OPTIONS = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "MANAGER", label: "Product Manager" },
] as const;

export type TeamOptionValue = (typeof TEAM_OPTIONS)[number]["value"];