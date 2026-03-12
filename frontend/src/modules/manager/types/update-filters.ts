export type UpdateFilter = "ON_LEAVE" | "BLOCKER" | "LATE" | "EDITED";

export const UPDATE_FILTER_OPTIONS: Array<{ value: UpdateFilter; label: string }> = [
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "BLOCKER", label: "Critical" },
  { value: "LATE", label: "Late" },
  { value: "EDITED", label: "Edited" },
];
