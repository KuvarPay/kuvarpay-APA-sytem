DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExchangeDepositStatus') THEN
        CREATE TYPE "public"."ExchangeDepositStatus" AS ENUM('PENDING', 'CONFIRMED', 'LIQUIDATED', 'FAILED');
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'SweepStatus' AND e.enumlabel = 'SKIPPED') THEN
        ALTER TYPE "public"."SweepStatus" ADD VALUE 'SKIPPED';
    END IF;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exchange_deposits" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"tx_hash" text,
	"network" text NOT NULL,
	"status" "ExchangeDepositStatus" DEFAULT 'PENDING' NOT NULL,
	"usd_amount" numeric(18, 2),
	"last_error" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exchange_deposits' AND column_name = 'status' AND data_type = 'character varying'
    ) THEN
        ALTER TABLE "exchange_deposits" ALTER COLUMN "status" TYPE "public"."ExchangeDepositStatus" USING status::"public"."ExchangeDepositStatus";
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "senderAddress" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_exchange_deposits_status" ON "exchange_deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_exchange_deposits_token" ON "exchange_deposits" USING btree ("token" text_ops);--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN IF EXISTS "director_declaration";