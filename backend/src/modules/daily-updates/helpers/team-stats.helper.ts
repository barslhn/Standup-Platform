import type { dailyUpdates, users } from '../../../core/database/schema';

type DailyUpdate = typeof dailyUpdates.$inferSelect;
type User = typeof users.$inferSelect;

export interface TeamStatsRawData {
  employees: User[];
  managers: User[];
  updates: Pick<DailyUpdate, 'userId' | 'hasBlocker' | 'status' | 'createdAt' | 'updatedAt'>[];
}

export interface TeamStatsResult {
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
  employeeUsers: { id: string; name: string; team: string; role: string }[];
  managerUsers: { id: string; name: string; team: string; role: string }[];
  missingUsers: { id: string; name: string; team: string; role: string }[];
}

function toPublicUser(user: User) {
  return { id: user.id, name: user.name, team: user.team, role: user.role };
}
export function computeTeamStats(
  targetDate: string,
  normalizedTeam: string | undefined,
  { employees, managers, updates }: TeamStatsRawData,
): TeamStatsResult {
  const submittedIds = new Set(updates.map((item) => item.userId));
  const missingUsers = employees.filter((employee) => !submittedIds.has(employee.id));

  const submittedCount = submittedIds.size;
  const totalEmployees = employees.length;
  const totalManagers = managers.length;
  const totalUsers = totalEmployees + totalManagers;
  const missingCount = Math.max(totalEmployees - submittedCount, 0);
  const blockerCount = updates.filter((item) => item.hasBlocker).length;
  const onLeaveCount = updates.filter((item) => item.status === 'ON_LEAVE').length;
  const editedCount = updates.filter(
    (item) => item.updatedAt.getTime() !== item.createdAt.getTime(),
  ).length;
  const blockerRate =
    submittedCount > 0 ? Number(((blockerCount / submittedCount) * 100).toFixed(1)) : 0;

  return {
    date: targetDate,
    team: normalizedTeam ?? 'ALL',
    totalEmployees,
    totalManagers,
    totalUsers,
    submittedCount,
    missingCount,
    blockerCount,
    onLeaveCount,
    editedCount,
    blockerRate,
    employeeUsers: employees.map(toPublicUser),
    managerUsers: managers.map(toPublicUser),
    missingUsers: missingUsers.map(toPublicUser),
  };
}
