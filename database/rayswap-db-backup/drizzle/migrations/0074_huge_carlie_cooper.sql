CREATE TYPE "public"."LedgerAccountType" AS ENUM('MERCHANT', 'PLATFORM_REVENUE', 'ESCROW', 'FEES', 'SETTLEMENT');--> statement-breakpoint
CREATE TYPE "public"."LedgerEntryType" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text,
	"type" "LedgerAccountType" NOT NULL,
	"currency" text NOT NULL,
	"current_balance" numeric(18, 8) DEFAULT '0' NOT NULL,
	"pending_balance" numeric(18, 8) DEFAULT '0' NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"type" "LedgerEntryType" NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"balance_before" numeric(18, 8) NOT NULL,
	"balance_after" numeric(18, 8) NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "settlement_markup_percentage" numeric(5, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ledger_accounts_business_id_idx" ON "ledger_accounts" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "ledger_accounts_type_idx" ON "ledger_accounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "ledger_entries_account_id_idx" ON "ledger_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_reference_idx" ON "ledger_entries" USING btree ("reference_type","reference_id");