-- Drop all foreign key constraints that will be affected by column type changes
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_customerId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP CONSTRAINT "subscription_checkout_sessions_customerId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP CONSTRAINT "subscription_checkout_sessions_priceId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" DROP CONSTRAINT "subscription_checkout_sessions_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_events" DROP CONSTRAINT "subscription_events_customerId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_events" DROP CONSTRAINT "subscription_events_invoiceId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_events" DROP CONSTRAINT "subscription_events_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_invoices" DROP CONSTRAINT "subscription_invoices_priceId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_invoices" DROP CONSTRAINT "subscription_invoices_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_customerId_fkey";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_priceId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" DROP CONSTRAINT "subscription_charge_attempts_invoiceId_fkey";--> statement-breakpoint
ALTER TABLE "subscription_prices" DROP CONSTRAINT "subscription_prices_planId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" DROP CONSTRAINT "sandbox_payment_methods_customerId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP CONSTRAINT "sandbox_subscription_checkout_sessions_customerId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP CONSTRAINT "sandbox_subscription_checkout_sessions_priceId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" DROP CONSTRAINT "sandbox_subscription_checkout_sessions_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" DROP CONSTRAINT "sandbox_subscription_events_customerId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" DROP CONSTRAINT "sandbox_subscription_events_invoiceId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" DROP CONSTRAINT "sandbox_subscription_events_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" DROP CONSTRAINT "sandbox_subscription_invoices_priceId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" DROP CONSTRAINT "sandbox_subscription_invoices_subscriptionId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" DROP CONSTRAINT "sandbox_subscriptions_customerId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" DROP CONSTRAINT "sandbox_subscriptions_priceId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" DROP CONSTRAINT "sandbox_subscription_charge_attempts_invoiceId_fkey";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" DROP CONSTRAINT "sandbox_subscription_prices_planId_fkey";--> statement-breakpoint

-- Alter column types
ALTER TABLE "customers" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_customers" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ALTER COLUMN "invoice_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ALTER COLUMN "invoice_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_plans" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" ALTER COLUMN "plan_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ALTER COLUMN "invoice_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_events" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_events" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_events" ALTER COLUMN "invoice_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_events" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_plans" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_prices" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_prices" ALTER COLUMN "plan_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "customer_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "price_id" SET DATA TYPE text;--> statement-breakpoint

-- Recreate all foreign key constraints
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD CONSTRAINT "subscription_checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_charge_attempts" ADD CONSTRAINT "subscription_charge_attempts_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."subscription_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_prices" ADD CONSTRAINT "subscription_prices_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_payment_methods" ADD CONSTRAINT "sandbox_payment_methods_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_checkout_sessions" ADD CONSTRAINT "sandbox_subscription_checkout_sessions_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."sandbox_subscription_invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_events" ADD CONSTRAINT "sandbox_subscription_events_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ADD CONSTRAINT "sandbox_subscription_invoices_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_invoices" ADD CONSTRAINT "sandbox_subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_customerId_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."sandbox_customers"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD CONSTRAINT "sandbox_subscriptions_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."sandbox_subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_charge_attempts" ADD CONSTRAINT "sandbox_subscription_charge_attempts_invoiceId_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."sandbox_subscription_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_prices" ADD CONSTRAINT "sandbox_subscription_prices_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."sandbox_subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint