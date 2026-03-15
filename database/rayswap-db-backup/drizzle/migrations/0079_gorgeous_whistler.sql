CREATE TYPE "public"."RefundStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
ALTER TYPE "public"."CheckoutStatus" ADD VALUE 'REFUNDED';--> statement-breakpoint
ALTER TYPE "public"."TransactionStatus" ADD VALUE 'REFUNDED';--> statement-breakpoint
CREATE TABLE "pending_refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"transactionId" text NOT NULL,
	"walletAddress" text NOT NULL,
	"refundAddress" text NOT NULL,
	"network" text NOT NULL,
	"currency" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"usdValue" numeric(18, 8),
	"status" "RefundStatus" DEFAULT 'PENDING' NOT NULL,
	"transferHash" text,
	"lastError" text,
	"retryCount" integer DEFAULT 0 NOT NULL,
	"nextRetryAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pending_refunds" ADD CONSTRAINT "pending_refunds_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "pending_refunds_status_idx" ON "pending_refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pending_refunds_next_retry_at_idx" ON "pending_refunds" USING btree ("nextRetryAt");--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN "directorDeclaration";