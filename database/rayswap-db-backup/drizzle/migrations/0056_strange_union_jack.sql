DROP INDEX "users_email_key";--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops) WHERE "deletedAt" IS NULL;