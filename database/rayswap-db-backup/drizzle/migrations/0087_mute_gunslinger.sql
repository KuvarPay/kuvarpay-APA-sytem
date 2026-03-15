ALTER TABLE "checkout_sessions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "metadata" jsonb;