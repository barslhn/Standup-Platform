CREATE TABLE IF NOT EXISTS "standup_settings" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "working_days" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
  "start_time" varchar(5) DEFAULT '09:00' NOT NULL,
  "end_time" varchar(5) DEFAULT '18:00' NOT NULL,
  "late_after" varchar(5) DEFAULT '09:30' NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

INSERT INTO "standup_settings" ("id") VALUES (1)
ON CONFLICT ("id") DO NOTHING;
