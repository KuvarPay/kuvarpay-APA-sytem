CREATE TABLE "sandbox_customers" (
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
	CONSTRAINT "sandbox_customers_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"customer_id" integer NOT NULL,
	"type" "PaymentMethodType" NOT NULL,
	"wallet_address" text,
	"chain" text,
	"bank_account" text,
	"mobile_number" text,
	"approved_spender" text,
	"token_contract" text,
	"token_decimals" integer,
	"allowance_amount" numeric(78, 0),
	"auth_id" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sandbox_payment_methods_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_charge_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
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
	CONSTRAINT "sandbox_subscription_charge_attempts_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_checkout_sessions" (
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
	"token_id" text,
	"expires_at" timestamp(3),
	"completed_at" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sandbox_subscription_checkout_sessions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"network" text NOT NULL,
	"name" text,
	"image_url" text,
	"token_contract" text,
	"legacy_ticker" text,
	"decimals" integer,
	"last_updated" timestamp(3),
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_events" (
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
	CONSTRAINT "sandbox_subscription_events_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"subscription_id" integer NOT NULL,
	"price_id" integer NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"status" "SubscriptionInvoiceStatus" DEFAULT 'DRAFT' NOT NULL,
	"period_start" timestamp(3) with time zone NOT NULL,
	"period_end" timestamp(3) with time zone NOT NULL,
	"due_date" timestamp(3) with time zone NOT NULL,
	"paid_at" timestamp(3) with time zone,
	"voided_at" timestamp(3) with time zone,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"next_payment_attempt" timestamp(3) with time zone,
	"processing" boolean DEFAULT false NOT NULL,
	"onchain_invoice_id" text,
	"from_amount_units" numeric(78, 0),
	"from_amount_human" text,
	"exchange_rate" numeric(30, 10),
	"exchange_source" text,
	"fees" jsonb,
	"quote_expires_at" timestamp(3) with time zone,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sandbox_subscription_invoices_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_plans" (
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
	CONSTRAINT "sandbox_subscription_plans_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscription_prices" (
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
	CONSTRAINT "sandbox_subscription_prices_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "sandbox_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"business_id" text NOT NULL,
	"customer_id" integer NOT NULL,
	"price_id" integer NOT NULL,
	"auth_id" text,
	"token_id" text,
	"status" "SubscriptionStatus" DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp(3) with time zone NOT NULL,
	"current_period_end" timestamp(3) with time zone NOT NULL,
	"trial_start" timestamp(3) with time zone,
	"trial_end" timestamp(3) with time zone,
	"cancelled_at" timestamp(3),
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"wallet_address" text,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "sandbox_subscriptions_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "sandbox_customers" ADD CONSTRAINT "sandbox_customers_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" ADD CONSTRAINT "sandbox_payment_methods_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" ADD CONSTRAINT "sandbox_payment_methods_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ADD CONSTRAINT "sandbox_subscription_charge_attempts_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ADD CONSTRAINT "sandbox_subscription_charge_attempts_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."sandbox_subscription_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ADD CONSTRAINT "sandbox_subscription_charge_attempts_transactionId_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_tokenId_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."sandbox_subscription_currencies"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."sandbox_subscription_invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ADD CONSTRAINT "sandbox_subscription_invoices_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ADD CONSTRAINT "sandbox_subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ADD CONSTRAINT "sandbox_subscription_invoices_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_plans" ADD CONSTRAINT "sandbox_subscription_plans_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" ADD CONSTRAINT "sandbox_subscription_prices_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."sandbox_subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_tokenId_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."sandbox_subscription_currencies"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_customers_uid_key" ON "sandbox_customers" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_customers_business_email_key" ON "sandbox_customers" USING btree ("business_id" text_ops,"email" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_customers_business_id_idx" ON "sandbox_customers" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_customers_wallet_address_idx" ON "sandbox_customers" USING btree ("wallet_address" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_customers_business_wallet_unique" ON "sandbox_customers" USING btree ("business_id" text_ops,"wallet_address" text_ops) WHERE "sandbox_customers"."wallet_address" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_payment_methods_uid_key" ON "sandbox_payment_methods" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_business_id_idx" ON "sandbox_payment_methods" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_customer_id_idx" ON "sandbox_payment_methods" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_type_idx" ON "sandbox_payment_methods" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_wallet_address_idx" ON "sandbox_payment_methods" USING btree ("wallet_address" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_auth_id_idx" ON "sandbox_payment_methods" USING btree ("auth_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_payment_methods_token_contract_idx" ON "sandbox_payment_methods" USING btree ("token_contract" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_payment_methods_customer_default_unique" ON "sandbox_payment_methods" USING btree ("customer_id" int4_ops) WHERE "sandbox_payment_methods"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_charge_attempts_uid_key" ON "sandbox_subscription_charge_attempts" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_charge_attempts_business_id_idx" ON "sandbox_subscription_charge_attempts" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_charge_attempts_invoice_id_idx" ON "sandbox_subscription_charge_attempts" USING btree ("invoice_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_charge_attempts_transaction_id_idx" ON "sandbox_subscription_charge_attempts" USING btree ("transaction_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_charge_attempts_status_idx" ON "sandbox_subscription_charge_attempts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_charge_attempts_transaction_hash_idx" ON "sandbox_subscription_charge_attempts" USING btree ("transaction_hash" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_checkout_sessions_uid_key" ON "sandbox_subscription_checkout_sessions" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_business_id_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_price_id_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_status_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_expires_at_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_status_expires_at_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("status" enum_ops,"expires_at");--> statement-breakpoint
CREATE INDEX "sandbox_subscription_checkout_sessions_token_id_idx" ON "sandbox_subscription_checkout_sessions" USING btree ("token_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_currencies_network_idx" ON "sandbox_subscription_currencies" USING btree ("network" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_currencies_ticker_idx" ON "sandbox_subscription_currencies" USING btree ("ticker" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_currencies_ticker_network_unique" ON "sandbox_subscription_currencies" USING btree ("ticker" text_ops,"network" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_events_uid_key" ON "sandbox_subscription_events" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_business_id_idx" ON "sandbox_subscription_events" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_subscription_id_idx" ON "sandbox_subscription_events" USING btree ("subscription_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_event_type_idx" ON "sandbox_subscription_events" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_processed_idx" ON "sandbox_subscription_events" USING btree ("processed" bool_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_events_created_at_idx" ON "sandbox_subscription_events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_invoices_uid_key" ON "sandbox_subscription_invoices" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_business_id_idx" ON "sandbox_subscription_invoices" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_subscription_id_idx" ON "sandbox_subscription_invoices" USING btree ("subscription_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_price_id_idx" ON "sandbox_subscription_invoices" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_status_idx" ON "sandbox_subscription_invoices" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_due_date_idx" ON "sandbox_subscription_invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_next_attempt_idx" ON "sandbox_subscription_invoices" USING btree ("next_payment_attempt");--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_status_next_attempt_processing_idx" ON "sandbox_subscription_invoices" USING btree ("status" enum_ops,"next_payment_attempt","processing" bool_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_invoices_onchain_id_idx" ON "sandbox_subscription_invoices" USING btree ("onchain_invoice_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_plans_uid_key" ON "sandbox_subscription_plans" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_plans_business_id_idx" ON "sandbox_subscription_plans" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_plans_chain_token_idx" ON "sandbox_subscription_plans" USING btree ("chain" text_ops,"token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_prices_uid_key" ON "sandbox_subscription_prices" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_prices_plan_id_idx" ON "sandbox_subscription_prices" USING btree ("plan_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_prices_billing_interval_idx" ON "sandbox_subscription_prices" USING btree ("billing_interval" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscriptions_uid_key" ON "sandbox_subscriptions" USING btree ("uid" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscriptions_auth_id_key" ON "sandbox_subscriptions" USING btree ("auth_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscriptions_customer_price_active_key" ON "sandbox_subscriptions" USING btree ("customer_id" int4_ops,"price_id" int4_ops) WHERE "sandbox_subscriptions"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_business_id_idx" ON "sandbox_subscriptions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_customer_id_idx" ON "sandbox_subscriptions" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_price_id_idx" ON "sandbox_subscriptions" USING btree ("price_id" int4_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_status_idx" ON "sandbox_subscriptions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_current_period_end_idx" ON "sandbox_subscriptions" USING btree ("current_period_end");--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_cancel_at_period_end_idx" ON "sandbox_subscriptions" USING btree ("cancel_at_period_end" bool_ops) WHERE "sandbox_subscriptions"."cancel_at_period_end" = true;--> statement-breakpoint
CREATE INDEX "sandbox_subscriptions_token_id_idx" ON "sandbox_subscriptions" USING btree ("token_id" text_ops);