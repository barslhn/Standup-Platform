import { Injectable, Inject } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../../core/database/schema';
import * as schema from '../../core/database/schema';
import { IGenericRepository } from '../../common/interfaces/base.repository';
import { DRIZZLE } from '../../core/database/database.module';

type User = typeof users.$inferSelect;
type InsertUser = typeof users.$inferInsert;
type UpdateUser = Partial<InsertUser>;

@Injectable()
export class UserRepository implements IGenericRepository<User, InsertUser, UpdateUser> {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async findAll(skip = 0, limit = 20): Promise<User[]> {
    return this.db.select().from(users).offset(skip).limit(limit);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1);
    return user ?? null;
  }

  async updateByEmail(email: string, data: UpdateUser): Promise<User | null> {
    const [user] = await this.db.update(users).set(data).where(eq(users.email, email)).returning();
    return user ?? null;
  }

  async findAllManagers(team?: string): Promise<User[]> {
    if (!team) {
      return this.db.select().from(users).where(eq(users.role, 'MANAGER'));
    }

    return this.db
      .select()
      .from(users)
      .where(and(eq(users.role, 'MANAGER'), eq(users.team, team)));
  }

  async findAllEmployees(team?: string): Promise<User[]> {
    if (!team) {
      return this.db.select().from(users).where(eq(users.role, 'EMPLOYEE'));
    }

    return this.db
      .select()
      .from(users)
      .where(and(eq(users.role, 'EMPLOYEE'), eq(users.team, team)));
  }

  async findDistinctTeams(): Promise<string[]> {
    const rows = await this.db
      .selectDistinct({ team: users.team })
      .from(users)
      .orderBy(asc(users.team));

    return rows.map((row) => row.team);
  }

  async create(data: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: UpdateUser): Promise<User | null> {
    const [user] = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return user ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
