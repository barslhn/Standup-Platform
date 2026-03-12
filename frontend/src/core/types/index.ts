export type UserRole = "EMPLOYEE" | "MANAGER";
export type UpdateStatus = "ACTIVE" | "ON_LEAVE";

export interface User {
  id: string;
  email: string;
  name: string;
  team?: string;
  role: UserRole;
}
export interface AuthResponse {
  access_token: string;
  user: User;
}
export interface DailyUpdate {
  id: string;
  userId: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  hasBlocker: boolean;
  status: UpdateStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
  user: (Pick<User, "id" | "name" | "email"> & { team?: string }) | null;
}

export interface CreateDailyUpdateDto {
  yesterday?: string;
  today?: string;
  blockers?: string | null;
  hasBlocker: boolean;
  status: UpdateStatus;
  date: string;
}

export type UpdateDailyUpdateDto = Partial<CreateDailyUpdateDto>;

export interface StandupPolicy {
  id: number;
  workingDays: number[];
  startTime: string;
  endTime: string;
  lateStart: string;
  lateAfter: string;
  updatedAt: string;
}

export interface UpdateStandupPolicyDto {
  workingDays: number[];
  startTime: string;
  endTime: string;
  lateStart: string;
  lateAfter: string;
}

export interface TeamStatsUser {
  id: string;
  name: string;
  team?: string;
  role: UserRole;
}

export interface TeamStats {
  date: string;
  team: string;
  totalEmployees: number;
  totalManagers: number;
  totalUsers: number;
  submittedCount: number;
  missingCount: number;
  blockerCount: number;
  onLeaveCount: number;
  editedCount: number;
  blockerRate: number;
  employeeUsers: TeamStatsUser[];
  managerUsers: TeamStatsUser[];
  missingUsers: TeamStatsUser[];
}

export interface UpdateVersion {
  id: string;
  updateId: string;
  data: Partial<DailyUpdate>;
  changedBy: string;
  changedAt: string;
  changedByUser?: Pick<User, "id" | "name">;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}