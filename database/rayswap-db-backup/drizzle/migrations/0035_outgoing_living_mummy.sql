ALTER TABLE "checkout_sessions" ADD COLUMN "callback_url" text;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "redirect_url" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "callback_url" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "redirect_url" text;