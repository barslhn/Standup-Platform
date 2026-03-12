ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires_at" timestamp;
