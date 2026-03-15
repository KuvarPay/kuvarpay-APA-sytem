ALTER TABLE "payment_methods" ADD COLUMN "auth_id" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "auth_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "payment_methods_auth_id_idx" ON "payment_methods" USING btree ("auth_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_auth_id_key" ON "subscriptions" USING btree ("auth_id" text_ops);