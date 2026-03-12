CREATE TYPE "public"."update_status" AS ENUM('ACTIVE', 'ON_LEAVE', 'SICK');--> statement-breakpoint
ALTER TABLE "daily_updates" ADD COLUMN "status" "update_status" DEFAULT 'ACTIVE' NOT NULL;