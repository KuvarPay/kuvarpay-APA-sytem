ALTER TABLE "checkout_sessions" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "customer_email" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "customer_name" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "customer_email" text;