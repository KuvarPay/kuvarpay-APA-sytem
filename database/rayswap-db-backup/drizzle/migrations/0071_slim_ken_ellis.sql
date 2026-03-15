CREATE TYPE "public"."AgentPayoutStatus" AS ENUM('PENDING', 'PAID', 'REJECTED');--> statement-breakpoint
CREATE TABLE "agent_payout_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"amount_ngn" numeric(18, 2) NOT NULL,
	"status" "AgentPayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"paid_at" timestamp(3),
	"admin_notes" text
);
--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "account_name" text;--> statement-breakpoint
ALTER TABLE "agent_payout_requests" ADD CONSTRAINT "agent_payout_requests_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "agent_payout_requests_agent_id_idx" ON "agent_payout_requests" USING btree ("agent_id" text_ops);