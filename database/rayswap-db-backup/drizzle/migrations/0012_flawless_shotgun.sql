CREATE TYPE "public"."BillingMode" AS ENUM('FIXED', 'METERED');--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "billingMode" "BillingMode" DEFAULT 'FIXED' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "target_currency" text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "target_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "billingMode" "BillingMode" DEFAULT 'FIXED' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "usage_quantity" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "usage_description" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "billingMode" "BillingMode" DEFAULT 'FIXED' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cap_amount" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "max_per_charge" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "authorization_expiry" timestamp(3) with time zone;