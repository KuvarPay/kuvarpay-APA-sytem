ALTER TABLE "sandbox_subscriptions" ADD COLUMN "total_cycles_allowed" integer;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "cycles_used" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sandbox_subscriptions" ADD COLUMN "cycle_tracking_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "total_cycles_allowed" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cycles_used" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cycle_tracking_enabled" boolean DEFAULT false NOT NULL;