ALTER TABLE "sandbox_subscription_invoices" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "subscription_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ALTER COLUMN "price_id" SET DATA TYPE text;