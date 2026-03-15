ALTER TABLE "subscription_invoices" DROP CONSTRAINT "subscription_invoices_priceId_fkey";
--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "auth_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_checkout_sessions" ADD COLUMN "token_id" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "onchain_invoice_id" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "from_amount_units" numeric(78, 0);--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "from_amount_human" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "exchange_rate" numeric(30, 10);--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "exchange_source" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "fees" jsonb;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD COLUMN "quote_expires_at" timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "token_id" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_priceId_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."subscription_prices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "payment_methods_token_contract_idx" ON "payment_methods" USING btree ("token_contract" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_checkout_sessions_token_id_idx" ON "subscription_checkout_sessions" USING btree ("token_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_onchain_id_idx" ON "subscription_invoices" USING btree ("onchain_invoice_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscriptions_token_id_idx" ON "subscriptions" USING btree ("token_id" text_ops);