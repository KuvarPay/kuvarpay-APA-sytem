ALTER TABLE "invoices" ADD COLUMN "settlement_currency" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_rate_source" text DEFAULT 'exchangerate-api';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_rate_fetched_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_rate_last_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "fx_rate_next_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "settlement_currency" text;--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_rate_source" text DEFAULT 'exchangerate-api';--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_rate_fetched_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_rate_last_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "fx_rate_next_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "settlement_currency" text;--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_rate_source" text DEFAULT 'exchangerate-api';--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_rate_fetched_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_rate_last_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "fx_rate_next_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "settlement_currency" text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_rate_source" text DEFAULT 'exchangerate-api';--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_rate_fetched_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_rate_last_update_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "fx_rate_next_update_at" timestamp(3);