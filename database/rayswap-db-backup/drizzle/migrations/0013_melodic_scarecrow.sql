ALTER TABLE "sandbox_subscription_checkout_sessions" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "billingMode" "BillingMode" DEFAULT 'FIXED' NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "target_currency" text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD COLUMN "target_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "billingMode" "BillingMode" DEFAULT 'FIXED' NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "cap_amount" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "max_per_charge" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "authorization_expiry" timestamp(3) with time zone;