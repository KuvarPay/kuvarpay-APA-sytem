CREATE TYPE "public"."BillingInterval" AS ENUM('MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY');--> statement-breakpoint
CREATE TYPE "public"."ChargeStatus" AS ENUM('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."PaymentMethodType" AS ENUM('CRYPTO_WALLET', 'BANK_TRANSFER', 'MOBILE_MONEY');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionInvoiceStatus" AS ENUM('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'UNPAID', 'TRIALING');--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"wallet_address" text,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "customers_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"customer_id" integer NOT NULL,
	"type" "PaymentMethodType" NOT NULL,
	"wallet_address" text,
	"chain" text,
	"bank_account" text,
	"mobile_number" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "payment_methods_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_charge_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"invoice_id" integer NOT NULL,
	"transaction_id" text,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"status" "ChargeStatus" DEFAULT 'PENDING' NOT NULL,
	"wallet_address" text NOT NULL,
	"transaction_hash" text,
	"block_confirmations" integer DEFAULT 0,
	"chain" text NOT NULL,
	"failure_reason" text,
	"processed_at" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_charge_attempts_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_checkout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"price_id" integer NOT NULL,
	"customer_id" integer,
	"customer_email" text,
	"status" "CheckoutStatus" DEFAULT 'PENDING' NOT NULL,
	"success_url" text,
	"cancel_url" text,
	"subscription_id" integer,
	"wallet_address" text,
	"chain" text,
	"expires_at" timestamp(3),
	"completed_at" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_checkout_sessions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"subscription_id" integer,
	"invoice_id" integer,
	"customer_id" integer,
	"event_type" text NOT NULL,
	"data" jsonb NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp(3),
	"webhook_delivered" boolean DEFAULT false NOT NULL,
	"webhook_delivered_at" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_events_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"subscription_id" integer NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"status" "SubscriptionInvoiceStatus" DEFAULT 'DRAFT' NOT NULL,
	"period_start" timestamp(3) NOT NULL,
	"period_end" timestamp(3) NOT NULL,
	"due_date" timestamp(3) NOT NULL,
	"paid_at" timestamp(3),
	"voided_at" timestamp(3),
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_payment_attempt" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_invoices_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"chain" text NOT NULL,
	"token" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_plans_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscription_prices" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"plan_id" integer NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"billing_interval" "BillingInterval" NOT NULL,
	"interval_count" integer DEFAULT 1 NOT NULL,
	"trial_period_days" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscription_prices_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"customer_id" integer NOT NULL,
	"price_id" integer NOT NULL,
	"status" "SubscriptionStatus" DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp(3) NOT NULL,
	"current_period_end" timestamp(3) NOT NULL,
	"trial_start" timestamp(3),
	"trial_end" timestamp(3),
	"cancelled_at" timestamp(3),
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"wallet_address" text,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "subscriptions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ADD CONSTRAINT "subscription_charge_attempts_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ADD CONSTRAINT "subscription_charge_attempts_transactionId_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_prices" ADD CONSTRAINT "subscription_prices_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "customers_uid_key" ON "customers" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "customers_business_email_key" ON "customers" USING btree ("business_id" text_ops,"email" text_ops);--> statement-breakpoint
CREATE INDEX "customers_business_id_idx" ON "customers" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "customers_wallet_address_idx" ON "customers" USING btree ("wallet_address" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_methods_uid_key" ON "payment_methods" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "payment_methods_customer_id_idx" ON "payment_methods" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "payment_methods_type_idx" ON "payment_methods" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "payment_methods_wallet_address_idx" ON "payment_methods" USING btree ("wallet_address" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_charge_attempts_uid_key" ON "subscription_charge_attempts" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_charge_attempts_invoice_id_idx" ON "subscription_charge_attempts" USING btree ("invoice_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_charge_attempts_transaction_id_idx" ON "subscription_charge_attempts" USING btree ("transaction_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_charge_attempts_status_idx" ON "subscription_charge_attempts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "subscription_charge_attempts_transaction_hash_idx" ON "subscription_charge_attempts" USING btree ("transaction_hash" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_checkout_sessions_uid_key" ON "subscription_checkout_sessions" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_business_id_idx" ON "subscription_checkout_sessions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_price_id_idx" ON "subscription_checkout_sessions" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_status_idx" ON "subscription_checkout_sessions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_expires_at_idx" ON "subscription_checkout_sessions" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_events_uid_key" ON "subscription_events" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_business_id_idx" ON "subscription_events" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_subscription_id_idx" ON "subscription_events" USING btree ("subscription_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_event_type_idx" ON "subscription_events" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_processed_idx" ON "subscription_events" USING btree ("processed" bool_ops);--> statement-breakpoint
CREATE INDEX "subscription_events_created_at_idx" ON "subscription_events" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_invoices_uid_key" ON "subscription_invoices" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_subscription_id_idx" ON "subscription_invoices" USING btree ("subscription_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_status_idx" ON "subscription_invoices" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_due_date_idx" ON "subscription_invoices" USING btree ("due_date" timestamp_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_next_attempt_idx" ON "subscription_invoices" USING btree ("next_payment_attempt" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_plans_uid_key" ON "subscription_plans" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_plans_business_id_idx" ON "subscription_plans" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_plans_chain_token_idx" ON "subscription_plans" USING btree ("chain" text_ops,"token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_prices_uid_key" ON "subscription_prices" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_prices_plan_id_idx" ON "subscription_prices" USING btree ("plan_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscription_prices_billing_interval_idx" ON "subscription_prices" USING btree ("billing_interval" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_uid_key" ON "subscriptions" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_customer_price_active_key" ON "subscriptions" USING btree ("customer_id" int4_ops,"price_id" int4_ops) WHERE "subscriptions"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "subscriptions_customer_id_idx" ON "subscriptions" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_price_id_idx" ON "subscriptions" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_status_idx" ON "subscriptions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions" USING btree ("current_period_end" timestamp_ops);