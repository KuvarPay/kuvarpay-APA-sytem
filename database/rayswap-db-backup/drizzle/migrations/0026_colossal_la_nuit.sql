DROP INDEX "sandbox_subscription_invoices_subscription_id_idx";--> statement-breakpoint
DROP INDEX "sandbox_subscription_invoices_price_id_idx";--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_subscription_id_idx" ON "sandbox_subscription_invoices" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_price_id_idx" ON "sandbox_subscription_invoices" USING btree ("price_id" text_ops);