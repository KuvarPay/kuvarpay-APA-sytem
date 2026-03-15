DROP INDEX "payment_methods_customer_id_idx";--> statement-breakpoint
DROP INDEX "payment_methods_customer_default_unique";--> statement-breakpoint
DROP INDEX "sandbox_payment_methods_customer_id_idx";--> statement-breakpoint
DROP INDEX "sandbox_payment_methods_customer_default_unique";--> statement-breakpoint
DROP INDEX "sandbox_subscription_checkout_sessions_price_id_idx";--> statement-breakpoint
DROP INDEX "sandbox_subscription_events_subscription_id_idx";--> statement-breakpoint
DROP INDEX "sandbox_subscriptions_customer_price_active_key";--> statement-breakpoint
DROP INDEX "sandbox_subscriptions_customer_id_idx";--> statement-breakpoint
DROP INDEX "sandbox_subscriptions_price_id_idx";--> statement-breakpoint
DROP INDEX "subscription_checkout_sessions_price_id_idx";--> statement-breakpoint
DROP INDEX "subscription_events_subscription_id_idx";--> statement-breakpoint
DROP INDEX "subscription_invoices_subscription_id_idx";--> statement-breakpoint
DROP INDEX "subscription_invoices_price_id_idx";--> statement-breakpoint
CREATE INDEX "payment_methods_customer_id_idx" ON "payment_methods" USING btree ("customer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_customer_default_unique" ON "payment_methods" USING btree ("customer_id" text_ops) WHERE "payment_methods"."is_default" = true;--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_customer_id_idx" ON "sandbox_payment_methods" USING btree ("customer_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_payment_methods_customer_default_unique" ON "sandbox_payment_methods" USING btree ("customer_id" text_ops) WHERE "sandbox_payment_methods"."is_default" = true;--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_price_id_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("price_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_subscription_id_idx" ON "sandbox_subscription_events" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscriptions_customer_price_active_key" ON "sandbox_subscriptions" USING btree ("customer_id" text_ops,"price_id" text_ops) WHERE "sandbox_subscriptions"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_customer_id_idx" ON "sandbox_subscriptions" USING btree ("customer_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_price_id_idx" ON "sandbox_subscriptions" USING btree ("price_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_price_id_idx" ON "subscription_checkout_sessions" USING btree ("price_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_subscription_id_idx" ON "subscription_events" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_subscription_id_idx" ON "subscription_invoices" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_price_id_idx" ON "subscription_invoices" USING btree ("price_id" text_ops);