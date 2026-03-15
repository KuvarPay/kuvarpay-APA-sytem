ALTER TABLE "payment_links" ADD COLUMN "success_url" text;--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "cancel_url" text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "success_url" text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "cancel_url" text;