import { Injectable, Logger } from '@nestjs/common';
import { DailyUpdateRepository } from './daily-update.repository';
import {
  CreateDailyUpdateDto,
  UpdateDailyUpdateDto,
  UpdateStandupPolicyDto,
} from './dto/daily-update.dto';
import { EventsGateway } from '../events/events.gateway';
import { UserRepository } from '../users/user.repository';
import { dailyUpdates } from '../../core/database/schema';
import { RedisService } from '../../common/redis/redis.service';
import {
  NotFoundException,
  AuthorizationException,
  BusinessRuleException,
  ValidationException,
} from '../../common/exceptions/app.exceptions';
import { computeTeamStats } from './helpers/team-stats.helper';

@Injectable()
export class DailyUpdateService {
  private readonly logger = new Logger(DailyUpdateService.name);

  constructor(
    private readonly repo: DailyUpdateRepository,
    private readonly userRepo: UserRepository,
    private readonly gateway: EventsGateway,
    private readonly redisService: RedisService,
  ) {}

  async create(userId: string, dto: CreateDailyUpdateDto) {
    const existing = await this.repo.findByUserAndDate(userId, dto.date);
    if (existing) {
      throw new BusinessRuleException(
        'Already submitted an update for this date. Please edit the existing one.',
      );
    }

    let payload: CreateDailyUpdateDto = dto;

    if (dto.status === 'ON_LEAVE') {
      const previousDayUpdate = await this.repo.findLatestBeforeDate(userId, dto.date);
      const previousDayHasBlocker = Boolean(previousDayUpdate?.hasBlocker);

      payload = {
        ...dto,
        yesterday: previousDayUpdate?.today ?? '-',
        today: 'On Leave',
        hasBlocker: previousDayHasBlocker,
        blockers: previousDayHasBlocker ? (previousDayUpdate?.blockers ?? null) : null,
      };
    }

    const normalized = this.normalizePayload(payload);
    const update = await this.repo.create({ ...normalized, date: dto.date, userId });

    await this.invalidateListCache();

    await this.broadcastUpdateToManagers(update, 'update_changed', 'create');
    if (update.hasBlocker) {
      await this.notifyManagersAboutBlocker(update);
    }

    return update;
  }

  async findAll(filters?: {
    skip?: number;
    limit?: number;
    date?: string;
    search?: string;
    team?: string;
    status?: 'ACTIVE' | 'ON_LEAVE';
  }) {
    const { skip = 0, limit = 100, ...rest } = filters ?? {};
    return this.repo.findAll(skip, limit, rest);
  }

  async findOne(id: string) {
    const update = await this.repo.findById(id);
    if (!update) throw new NotFoundException('Update not found');
    return update;
  }

  async update(userId: string, id: string, dto: UpdateDailyUpdateDto) {
    const update = await this.repo.findById(id);
    if (!update) throw new NotFoundException('Update not found');

    if (update.userId !== userId) {
      throw new AuthorizationException('You cannot edit this update');
    }

    if (update.status === 'ON_LEAVE') {
      throw new BusinessRuleException('On Leave update cannot be edited within the same day');
    }

    const normalized = this.normalizePayload(dto, update);

    const fieldsToCompare = ['status', 'yesterday', 'today', 'hasBlocker', 'blockers'];
    const isChanged = fieldsToCompare.some((field) => {
      return (
        (normalized as Record<string, unknown>)[field] !==
        (update as Record<string, unknown>)[field]
      );
    });

    if (!isChanged) {
      return update;
    }

    const updated = await this.repo.updateWithVersion(id, update, normalized, userId);

    await this.invalidateListCache();
    await this.invalidateItemCache(id);

    if (updated) {
      await this.broadcastUpdateToManagers(updated, 'update_changed', 'patch');
      if (updated.hasBlocker) {
        await this.notifyManagersAboutBlocker(updated);
      }
    }

    return updated;
  }

  async findVersions(id: string) {
    const update = await this.repo.findById(id);
    if (!update) throw new NotFoundException('Update not found');
    return this.repo.findVersions(id);
  }

  async findVersionsBatch(ids: string[]) {
    const uniqueIds = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

    if (uniqueIds.length === 0) {
      return {} as Record<string, Awaited<ReturnType<typeof this.repo.findVersions>>[number][]>;
    }

    const versions = await this.repo.findVersionsByUpdateIds(uniqueIds);
    const grouped = new Map<string, typeof versions>();

    uniqueIds.forEach((id) => {
      grouped.set(id, []);
    });

    versions.forEach((version) => {
      const current = grouped.get(version.updateId) ?? [];
      current.push(version);
      grouped.set(version.updateId, current);
    });

    return Object.fromEntries(grouped.entries());
  }

  async getStandupPolicy() {
    return this.repo.getStandupPolicy();
  }

  async getTeamStats(date?: string, team?: string) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    if (!this.isValidDate(targetDate)) {
      throw new ValidationException('Invalid date format. Expected YYYY-MM-DD');
    }

    const normalizedTeam = this.normalizeTeam(team);

    const [employees, managers, updates] = await Promise.all([
      this.userRepo.findAllEmployees(normalizedTeam),
      this.userRepo.findAllManagers(normalizedTeam),
      this.repo.findStatsByDate(targetDate, normalizedTeam),
    ]);

    return computeTeamStats(targetDate, normalizedTeam, { employees, managers, updates });
  }

  async updateStandupPolicy(dto: UpdateStandupPolicyDto) {
    const updatedPolicy = await this.repo.updateStandupPolicy({
      workingDays: dto.workingDays,
      startTime: dto.startTime,
      endTime: dto.endTime,
      lateStart: dto.lateStart,
      lateAfter: dto.lateAfter,
    });

    await this.invalidatePolicyCache();

    return updatedPolicy;
  }

  private async broadcastUpdateToManagers(
    updateData: typeof dailyUpdates.$inferSelect,
    event: string,
    action: 'create' | 'patch',
  ) {
    try {
      const [managers, user] = await Promise.all([
        this.userRepo.findAllManagers(),
        this.userRepo.findById(updateData.userId),
      ]);

      const payload = {
        action,
        updateId: updateData.id,
        user: { id: user?.id, name: user?.name, email: user?.email },
        date: updateData.date,
        hasBlocker: updateData.hasBlocker,
      };

      managers.forEach((manager) => {
        this.gateway.sendToUser(manager.id, event, payload);
      });
    } catch (error) {
      this.logger.error('Update changed notification failed:', error);
    }
  }

  private async notifyManagersAboutBlocker(updateData: typeof dailyUpdates.$inferSelect) {
    try {
      const [managers, user] = await Promise.all([
        this.userRepo.findAllManagers(),
        this.userRepo.findById(updateData.userId),
      ]);

      const notificationPayload = {
        updateId: updateData.id,
        user: { id: user?.id, name: user?.name, email: user?.email },
        blockers: updateData.blockers,
        date: updateData.date,
      };

      managers.forEach((manager) => {
        this.gateway.sendToUser(manager.id, 'new_blocker', notificationPayload);
      });
    } catch (error) {
      this.logger.error('Blocker notification failed:', error);
    }
  }

  private async invalidateListCache() {
    const deletedCount = await this.invalidateCachePatterns([
      'cache:http:GET:/updates*',
      'cache:http:GET:/updates/stats/team*',
    ]);

    this.logger.debug(`Updates list cache cleared. Deleted records: ${deletedCount}`);
  }

  private async invalidateItemCache(id: string) {
    const deletedCount = await this.invalidateCachePatterns([
      `cache:http:GET:/updates/${id}*`,
      `cache:http:GET:/updates/${id}/versions*`,
    ]);

    this.logger.debug(`Update ${id} detail cache cleared. Deleted records: ${deletedCount}`);
  }

  private async invalidatePolicyCache() {
    const deletedCount = await this.invalidateCachePatterns(['cache:http:GET:/updates/policy*']);
    this.logger.debug(`Stand-up policy cache cleared. Deleted records: ${deletedCount}`);
  }

  private async invalidateCachePatterns(patterns: string[]): Promise<number> {
    let totalDeleted = 0;

    for (const pattern of patterns) {
      totalDeleted += await this.redisService.deleteByPattern(pattern);
    }

    return totalDeleted;
  }

  private normalizePayload(
    dto: CreateDailyUpdateDto | UpdateDailyUpdateDto,
    base?: typeof dailyUpdates.$inferSelect,
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

  private isValidDate(value: string): boolean {
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

  private normalizeTeam(team?: string): string | undefined {
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
}
