ALTER TABLE "payment_links" ADD COLUMN "allow_custom_amount" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "min_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "max_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "allow_custom_amount" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "min_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "max_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "checkout_sessions" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "checkout_sessions" DROP COLUMN "customer_email";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" DROP COLUMN "customer_name";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" DROP COLUMN "customer_email";