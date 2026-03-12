ALTER TYPE "public"."update_status" RENAME TO "update_status_old";--> statement-breakpoint
CREATE TYPE "public"."update_status" AS ENUM('ACTIVE', 'ON_LEAVE');--> statement-breakpoint
ALTER TABLE "daily_updates" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "daily_updates"
ALTER COLUMN "status" TYPE "public"."update_status"
USING (
  CASE
    WHEN "status"::text = 'SICK' THEN 'ON_LEAVE'::"public"."update_status"
    ELSE "status"::text::"public"."update_status"
  END
);--> statement-breakpoint
ALTER TABLE "daily_updates" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';--> statement-breakpoint
DROP TYPE "public"."update_status_old";