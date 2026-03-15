ALTER TABLE "payment_fiat_rates" ADD COLUMN "market_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "market_exchange_rate" numeric(18, 8);