ALTER TABLE "checkout_sessions" ADD COLUMN "display_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "display_currency" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "display_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "display_currency" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN "pos_enabled";