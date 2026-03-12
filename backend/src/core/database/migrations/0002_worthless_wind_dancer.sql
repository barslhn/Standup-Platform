DROP INDEX "daily_updates_date_idx";--> statement-breakpoint
DROP INDEX "daily_updates_user_idx";--> statement-breakpoint
CREATE INDEX "daily_updates_user_date_idx" ON "daily_updates" USING btree ("user_id","date");