DROP INDEX "users_email_key";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "previous_account_id" text;--> statement-breakpoint
CREATE INDEX "users_previousAccountId_idx" ON "users" USING btree ("previous_account_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops) WHERE "deletedAt" IS NULL;