ALTER TABLE "sandbox_transactions" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD COLUMN "fx_applied" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "fx_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "fx_applied" boolean DEFAULT false;