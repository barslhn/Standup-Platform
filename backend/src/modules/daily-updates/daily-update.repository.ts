import { Injectable, Inject } from '@nestjs/common';
import { and, desc, eq, ilike, inArray, lt, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { dailyUpdates, standupSettings, updateVersions, users } from '../../core/database/schema';
import * as schema from '../../core/database/schema';
import { IGenericRepository } from '../../common/interfaces/base.repository';
import { DRIZZLE } from '../../core/database/database.module';

type DailyUpdate = typeof dailyUpdates.$inferSelect;
type InsertDailyUpdate = typeof dailyUpdates.$inferInsert;
type UpdateDailyUpdate = Partial<InsertDailyUpdate>;
type StandupPolicy = typeof standupSettings.$inferSelect;

interface FindAllOptions {
  date?: string;
  search?: string;
  team?: string;
  status?: 'ACTIVE' | 'ON_LEAVE';
}

@Injectable()
export class DailyUpdateRepository implements IGenericRepository<
  DailyUpdate,
  InsertDailyUpdate,
  UpdateDailyUpdate
> {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) {}

  async create(data: InsertDailyUpdate): Promise<DailyUpdate> {
    const [row] = await this.db.insert(dailyUpdates).values(data).returning();
    return row;
  }

  async findById(id: string): Promise<DailyUpdate | null> {
    const [row] = await this.db.select().from(dailyUpdates).where(eq(dailyUpdates.id, id)).limit(1);
    return row ?? null;
  }

  async findAll(
    skip = 0,
    limit = 100,
    options: FindAllOptions = {},
  ): Promise<
    (DailyUpdate & { user: { id: string; name: string; email: string; team: string } | null })[]
  > {
    const { date, search, team, status } = options;

    const conditions = [];

    if (date) {
      conditions.push(eq(dailyUpdates.date, date));
    }

    if (team) {
      conditions.push(eq(users.team, team));
    }

    if (status) {
      conditions.push(eq(dailyUpdates.status, status));
    }

    if (search) {
      const normalizedSearch = search.replaceAll(/\s+/g, ' ').trimStart();

      if (normalizedSearch.length > 0) {
        const namePrefix = `${normalizedSearch}%`;
        const contentContains = `%${normalizedSearch}%`;

        conditions.push(
          or(
            ilike(users.name, namePrefix),
            ilike(dailyUpdates.yesterday, contentContains),
            ilike(dailyUpdates.today, contentContains),
            ilike(dailyUpdates.blockers, contentContains),
          ),
        );
      }
    }

    const baseQuery = this.db
      .select({
        id: dailyUpdates.id,
        userId: dailyUpdates.userId,
        yesterday: dailyUpdates.yesterday,
        today: dailyUpdates.today,
        blockers: dailyUpdates.blockers,
        hasBlocker: dailyUpdates.hasBlocker,
        status: dailyUpdates.status,
        date: dailyUpdates.date,
        createdAt: dailyUpdates.createdAt,
        updatedAt: dailyUpdates.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          team: users.team,
        },
      })
      .from(dailyUpdates)
      .leftJoin(users, eq(dailyUpdates.userId, users.id));

    const filteredQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    const rows = await filteredQuery
      .orderBy(desc(dailyUpdates.hasBlocker), desc(dailyUpdates.date), desc(dailyUpdates.updatedAt))
      .offset(skip)
      .limit(limit);
    return rows;
  }

  async findByUserAndDate(userId: string, date: string): Promise<DailyUpdate | null> {
    const [row] = await this.db
      .select()
      .from(dailyUpdates)
      .where(and(eq(dailyUpdates.userId, userId), eq(dailyUpdates.date, date)))
      .limit(1);
    return row ?? null;
  }

  async findLatestBeforeDate(userId: string, date: string): Promise<DailyUpdate | null> {
    const [row] = await this.db
      .select()
      .from(dailyUpdates)
      .where(and(eq(dailyUpdates.userId, userId), lt(dailyUpdates.date, date)))
      .orderBy(desc(dailyUpdates.date))
      .limit(1);

    return row ?? null;
  }

  async update(id: string, data: UpdateDailyUpdate): Promise<DailyUpdate | null> {
    const [row] = await this.db
      .update(dailyUpdates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(dailyUpdates.id, id))
      .returning();
    return row ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(dailyUpdates).where(eq(dailyUpdates.id, id));
  }

  async updateWithVersion(
    id: string,
    snapshot: DailyUpdate,
    dto: UpdateDailyUpdate,
    changedBy: string,
  ): Promise<DailyUpdate | null> {
    let updated: DailyUpdate | null = null;

    await this.db.transaction(async (tx) => {
      await tx.insert(updateVersions).values({
        updateId: id,
        data: snapshot as unknown as Record<string, unknown>,
        changedBy,
      });

      const [row] = await tx
        .update(dailyUpdates)
        .set({ ...dto, updatedAt: new Date() })
        .where(eq(dailyUpdates.id, id))
        .returning();

      updated = row ?? null;
    });

    return updated;
  }

  async findVersions(updateId: string) {
    return this.db.select().from(updateVersions).where(eq(updateVersions.updateId, updateId));
  }

  async findVersionsByUpdateIds(updateIds: string[]) {
    if (updateIds.length === 0) {
      return [];
    }

    return this.db
      .select()
      .from(updateVersions)
      .where(inArray(updateVersions.updateId, updateIds))
      .orderBy(desc(updateVersions.changedAt));
  }

  async findStatsByDate(date: string, team?: string) {
    const conditions = [eq(dailyUpdates.date, date), eq(users.role, 'EMPLOYEE')];

    if (team) {
      conditions.push(eq(users.team, team));
    }

    return this.db
      .select({
        userId: dailyUpdates.userId,
        hasBlocker: dailyUpdates.hasBlocker,
        status: dailyUpdates.status,
        createdAt: dailyUpdates.createdAt,
        updatedAt: dailyUpdates.updatedAt,
      })
      .from(dailyUpdates)
      .innerJoin(users, eq(dailyUpdates.userId, users.id))
      .where(and(...conditions));
  }

  async getStandupPolicy(): Promise<StandupPolicy> {
    const [policy] = await this.db
      .select()
      .from(standupSettings)
      .where(eq(standupSettings.id, 1))
      .limit(1);

    if (policy) {
      return policy;
    }

    const [created] = await this.db.insert(standupSettings).values({ id: 1 }).returning();
    return created;
  }

  async updateStandupPolicy(
    data: Pick<StandupPolicy, 'workingDays' | 'startTime' | 'endTime' | 'lateStart' | 'lateAfter'>,
  ): Promise<StandupPolicy> {
    const [row] = await this.db
      .insert(standupSettings)
      .values({
        id: 1,
        workingDays: data.workingDays,
        startTime: data.startTime,
        endTime: data.endTime,
        lateStart: data.lateStart,
        lateAfter: data.lateAfter,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: standupSettings.id,
        set: {
          workingDays: data.workingDays,
          startTime: data.startTime,
          endTime: data.endTime,
          lateStart: data.lateStart,
          lateAfter: data.lateAfter,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }
}
