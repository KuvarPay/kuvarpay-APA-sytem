DROP INDEX "settlement_accounts_business_primary_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "settlement_accounts_business_primary_unique" ON "settlement_accounts" USING btree ("business_id" text_ops,"is_primary" bool_ops) WHERE is_primary = true AND is_active = true;--> statement-breakpoint
ALTER TABLE "settlement_accounts" DROP COLUMN "flutterwave_recipient_id";