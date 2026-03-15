ALTER TABLE "invoices" ADD COLUMN "discount" numeric(18, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD COLUMN "discount" numeric(18, 2) DEFAULT '0' NOT NULL;