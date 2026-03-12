import { dailyUpdates } from '../../../core/database/schema';
import { CreateDailyUpdateDto, UpdateDailyUpdateDto } from '../dto/daily-update.dto';

type DailyUpdateEntity = typeof dailyUpdates.$inferSelect;

export function normalizeDailyUpdatePayload(
  dto: CreateDailyUpdateDto | UpdateDailyUpdateDto,
  base?: DailyUpdateEntity,
) {
  const status = dto.status ?? base?.status ?? 'ACTIVE';
  const hasBlocker = dto.hasBlocker ?? base?.hasBlocker ?? false;
  const yesterday = dto.yesterday ?? base?.yesterday ?? '-';
  const today = dto.today ?? base?.today ?? '-';

  if (status !== 'ACTIVE') {
    const leaveHasBlocker = dto.hasBlocker ?? false;
    const leaveYesterday = dto.yesterday?.trim() ? dto.yesterday : '-';
    const leaveToday = dto.today?.trim() ? dto.today : 'On Leave';
    const leaveBlockers = leaveHasBlocker ? (dto.blockers ?? null) : null;

    return {
      ...dto,
      status,
      yesterday: leaveYesterday,
      today: leaveToday,
      hasBlocker: leaveHasBlocker,
      blockers: leaveBlockers,
    };
  }

  const blockers = hasBlocker ? (dto.blockers ?? base?.blockers ?? null) : null;

  return {
    ...dto,
    status,
    yesterday,
    today,
    hasBlocker,
    blockers,
  };
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function normalizeTeamFilter(team?: string): string | undefined {
  if (!team) {
    return undefined;
  }

  const normalized = team.trim();
  const lowered = normalized.toLocaleLowerCase('en-US');

  if (lowered === 'all' || lowered === 'all teams') {
    return undefined;
  }

  return normalized;
}

export function groupVersionsByUpdateId<T extends { updateId: string }>(
  ids: string[],
  versions: T[],
): Record<string, T[]> {
  const grouped = new Map<string, T[]>();

  ids.forEach((id) => {
    grouped.set(id, []);
  });

  versions.forEach((version) => {
    const current = grouped.get(version.updateId) ?? [];
    current.push(version);
    grouped.set(version.updateId, current);
  });

  return Object.fromEntries(grouped.entries());
}
