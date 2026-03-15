-- Drop unique constraint that references the enum
DROP INDEX IF EXISTS "subscriptions_customer_price_active_key";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::text;--> statement-breakpoint
DROP TYPE "public"."SubscriptionStatus";--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED');--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"public"."SubscriptionStatus";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DATA TYPE "public"."SubscriptionStatus" USING "status"::"public"."SubscriptionStatus";--> statement-breakpoint
-- Recreate the unique constraint
CREATE UNIQUE INDEX "subscriptions_customer_price_active_key" ON "subscriptions" USING btree ("customer_id" int4_ops,"price_id" int4_ops) WHERE "subscriptions"."status" = 'ACTIVE';--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "period_start" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "period_end" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "due_date" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "paid_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "voided_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "next_payment_attempt" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "current_period_start" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "current_period_end" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "trial_start" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "trial_end" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "business_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "approved_spender" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "token_contract" text;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "token_decimals" integer;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD COLUMN "allowance_amount" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ADD COLUMN "business_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "business_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "price_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "processing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "business_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ADD CONSTRAINT "subscription_charge_attempts_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_business_wallet_unique" ON "customers" USING btree ("business_id" text_ops,"wallet_address" text_ops) WHERE "customers"."wallet_address" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "payment_methods_business_id_idx" ON "payment_methods" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_customer_default_unique" ON "payment_methods" USING btree ("customer_id" int4_ops) WHERE "payment_methods"."is_default" = true;--> statement-breakpoint
CREATE INDEX "subscription_charge_attempts_business_id_idx" ON "subscription_charge_attempts" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_status_expires_at_idx" ON "subscription_checkout_sessions" USING btree ("status" enum_ops,"expires_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_business_id_idx" ON "subscription_invoices" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_price_id_idx" ON "subscription_invoices" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_status_next_attempt_processing_idx" ON "subscription_invoices" USING btree ("status" enum_ops,"next_payment_attempt" timestamptz_ops,"processing" bool_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_business_id_idx" ON "subscriptions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_cancel_at_period_end_idx" ON "subscriptions" USING btree ("cancel_at_period_end" bool_ops) WHERE "subscriptions"."cancel_at_period_end" = true;