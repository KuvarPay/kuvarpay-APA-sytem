ALTER TABLE "sandbox_subscriptions" ADD COLUMN "current_renewal_counter" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "current_price_id" text;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "pending_price_change_id" text;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "renewal_window_start" timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tokenId_fkey" FOREIGN KEY ("token_id") REFERENCES "public"."currencies"("id") ON DELETE set null ON UPDATE cascade;