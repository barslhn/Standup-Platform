import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
  unique,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['EMPLOYEE', 'MANAGER']);
export const updateStatusEnum = pgEnum('update_status', ['ACTIVE', 'ON_LEAVE']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  team: varchar('team', { length: 100 }).notNull().default('General'),
  role: roleEnum('role').notNull().default('EMPLOYEE'),
  resetPasswordToken: varchar('reset_password_token', { length: 255 }),
  resetPasswordExpiresAt: timestamp('reset_password_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyUpdates = pgTable(
  'daily_updates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    yesterday: text('yesterday').notNull(),
    today: text('today').notNull(),
    blockers: text('blockers'),
    hasBlocker: boolean('has_blocker').notNull().default(false),
    status: updateStatusEnum('status').notNull().default('ACTIVE'),
    date: date('date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('user_date_unique').on(table.userId, table.date),
    index('daily_updates_user_date_idx').on(table.userId, table.date),
    index('daily_updates_blocker_idx').on(table.hasBlocker),
  ],
);

export const updateVersions = pgTable('update_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  updateId: uuid('update_id')
    .notNull()
    .references(() => dailyUpdates.id),
  data: jsonb('data').notNull(),
  changedBy: uuid('changed_by')
    .notNull()
    .references(() => users.id),
  changedAt: timestamp('changed_at').defaultNow().notNull(),
});

export const standupSettings = pgTable('standup_settings', {
  id: integer('id').primaryKey().default(1),
  workingDays: jsonb('working_days')
    .$type<number[]>()
    .notNull()
    .default(sql`'[1,2,3,4,5]'::jsonb`),
  startTime: varchar('start_time', { length: 5 }).notNull().default('09:00'),
  endTime: varchar('end_time', { length: 5 }).notNull().default('18:00'),
  lateStart: varchar('late_start', { length: 5 }).notNull().default('09:00'),
  lateAfter: varchar('late_after', { length: 5 }).notNull().default('09:30'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
