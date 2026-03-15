ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "expected_usage_currency" text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "expected_usage_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "strategy" text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "custom_multiplier" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "expected_usage_currency" text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "expected_usage_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "strategy" text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "custom_multiplier" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP COLUMN "target_currency";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP COLUMN "target_amount";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP COLUMN "target_currency";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP COLUMN "target_amount";