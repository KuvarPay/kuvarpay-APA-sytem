ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" DROP CONSTRAINT "subscription_charge_attempts_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP CONSTRAINT "subscription_checkout_sessions_uid_unique";--> statement-breakpoint
ALTER TABLE "subscription_events" DROP CONSTRAINT "subscription_events_uid_unique";--> statement-breakpoint
DROP INDEX "payment_methods_uid_key";--> statement-breakpoint
DROP INDEX "subscription_charge_attempts_uid_key";--> statement-breakpoint
DROP INDEX "subscription_checkout_sessions_uid_key";--> statement-breakpoint
DROP INDEX "subscription_events_uid_key";--> statement-breakpoint
ALTER TABLE "payment_methods" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "subscription_events" DROP COLUMN "uid";