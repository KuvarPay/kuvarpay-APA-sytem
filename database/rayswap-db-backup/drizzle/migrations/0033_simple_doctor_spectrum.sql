ALTER TABLE "invoices" ADD COLUMN "settlement_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "settlement_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "settlement_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "settlement_amount" numeric(18, 2);