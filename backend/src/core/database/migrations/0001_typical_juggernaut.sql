CREATE INDEX "daily_updates_date_idx" ON "daily_updates" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_updates_user_idx" ON "daily_updates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_updates_blocker_idx" ON "daily_updates" USING btree ("has_blocker");