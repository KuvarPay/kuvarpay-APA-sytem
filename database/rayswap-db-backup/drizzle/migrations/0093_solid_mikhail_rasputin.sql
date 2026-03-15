ALTER TABLE "checkout_sessions" RENAME COLUMN "display_amount" TO "original_amount";--> statement-breakpoint
ALTER TABLE "checkout_sessions" RENAME COLUMN "display_currency" TO "original_currency";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" RENAME COLUMN "display_amount" TO "original_amount";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" RENAME COLUMN "display_currency" TO "original_currency";--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD COLUMN "original_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD COLUMN "original_currency" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "original_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "original_currency" text;