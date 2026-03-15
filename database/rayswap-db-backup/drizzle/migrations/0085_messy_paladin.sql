ALTER TABLE "businesses" ADD COLUMN "custom_fiat_settlement_markup" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "custom_crypto_settlement_markup" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "custom_fx_markup" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN "settlement_markup_percentage";