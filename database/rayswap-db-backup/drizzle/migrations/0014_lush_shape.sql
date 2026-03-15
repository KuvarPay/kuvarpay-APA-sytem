ALTER TABLE "sandbox_payment_methods" DROP CONSTRAINT "sandbox_payment_methods_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" DROP CONSTRAINT "sandbox_subscription_charge_attempts_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP CONSTRAINT "sandbox_subscription_checkout_sessions_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" DROP CONSTRAINT "sandbox_subscription_events_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" DROP CONSTRAINT "sandbox_subscription_invoices_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_plans" DROP CONSTRAINT "sandbox_subscription_plans_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" DROP CONSTRAINT "sandbox_subscription_prices_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" DROP CONSTRAINT "sandbox_subscriptions_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_invoices" DROP CONSTRAINT "subscription_invoices_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_prices" DROP CONSTRAINT "subscription_prices_uid_unique";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_uid_unique";--> statement-breakpoint
DROP INDEX "sandbox_payment_methods_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_charge_attempts_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_checkout_sessions_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_events_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_invoices_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_plans_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscription_prices_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_subscriptions_uid_key";--> statement-breakpoint
DROP INDEX "subscription_invoices_uid_key";--> statement-breakpoint
DROP INDEX "subscription_plans_uid_key";--> statement-breakpoint
DROP INDEX "subscription_prices_uid_key";--> statement-breakpoint
DROP INDEX "subscriptions_uid_key";--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_plans" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_invoices" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_plans" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_prices" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "uid";