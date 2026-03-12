import { Injectable } from '@nestjs/common';
import { DailyUpdateRepository } from './daily-update.repository';
import {
  CreateDailyUpdateDto,
  UpdateDailyUpdateDto,
  UpdateStandupPolicyDto,
} from './dto/daily-update.dto';
import { UserRepository } from '../users/user.repository';
import {
  NotFoundException,
  AuthorizationException,
  BusinessRuleException,
  ValidationException,
} from '../../common/exceptions/app.exceptions';
import { computeTeamStats } from './helpers/team-stats.helper';
import { DailyUpdateCacheService } from './services/daily-update-cache.service';
import { DailyUpdateNotificationService } from './services/daily-update-notification.service';
import {
  groupVersionsByUpdateId,
  isValidIsoDate,
  normalizeDailyUpdatePayload,
  normalizeTeamFilter,
} from './utils/daily-update.utils';

@Injectable()
export class DailyUpdateService {
  constructor(
    private readonly repo: DailyUpdateRepository,
    private readonly userRepo: UserRepository,
    private readonly cacheService: DailyUpdateCacheService,
    private readonly notificationService: DailyUpdateNotificationService,
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

    const normalized = normalizeDailyUpdatePayload(payload);
    const update = await this.repo.create({ ...normalized, date: dto.date, userId });

    await this.cacheService.invalidateListCache();

    await this.notificationService.notifyUpdateChanged(update, 'create');
    if (update.hasBlocker) {
      await this.notificationService.notifyManagersAboutBlocker(update);
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

    const normalized = normalizeDailyUpdatePayload(dto, update);

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

    await this.cacheService.invalidateListCache();
    await this.cacheService.invalidateItemCache(id);

    if (updated) {
      await this.notificationService.notifyUpdateChanged(updated, 'patch');
      if (updated.hasBlocker) {
        await this.notificationService.notifyManagersAboutBlocker(updated);
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
    return groupVersionsByUpdateId(uniqueIds, versions);
  }

  async getStandupPolicy() {
    return this.repo.getStandupPolicy();
  }

  async getTeamStats(date?: string, team?: string) {
    const targetDate = date ?? new Date().toISOString().split('T')[0];
    if (!isValidIsoDate(targetDate)) {
      throw new ValidationException('Invalid date format. Expected YYYY-MM-DD');
    }

    const normalizedTeam = normalizeTeamFilter(team);

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

    await this.cacheService.invalidatePolicyCache();

    return updatedPolicy;
  }
}
