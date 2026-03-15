CREATE TYPE "public"."CryptoAsset" AS ENUM('USDT', 'USDC');--> statement-breakpoint
CREATE TYPE "public"."CryptoNetwork" AS ENUM('BEP20', 'POLYGON');--> statement-breakpoint
CREATE TYPE "public"."PreferredSettlementType" AS ENUM('FIAT', 'CRYPTO');--> statement-breakpoint
ALTER TYPE "public"."SettlementAccountType" ADD VALUE 'CRYPTO';--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "preferred_settlement_type" "PreferredSettlementType" DEFAULT 'FIAT' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "preferred_crypto_asset" "CryptoAsset";--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "preferred_crypto_network" "CryptoNetwork";--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "crypto_wallet_address" text;--> statement-breakpoint
ALTER TABLE "settlement_accounts" ADD COLUMN "network" "CryptoNetwork";--> statement-breakpoint
ALTER TABLE "settlement_accounts" ADD COLUMN "wallet_address" text;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "source_amount" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "source_currency" text;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "exchange_rate" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "crypto_asset" "CryptoAsset";--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "crypto_network" "CryptoNetwork";--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "crypto_amount" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "service_fee_fiat" numeric(18, 2);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "network_fee_crypto" numeric(18, 8);