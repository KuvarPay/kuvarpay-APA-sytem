CREATE TYPE "public"."AgentStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."RewardStatus" AS ENUM('PENDING', 'PAID');--> statement-breakpoint
CREATE TABLE "agent_attributions" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"business_id" text NOT NULL,
	"attributed_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp(3) NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_reward_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"milestone_usd_amount" numeric(18, 2) NOT NULL,
	"reward_ngn_amount" numeric(18, 2) NOT NULL,
	"fx_rate_used" numeric(18, 8) NOT NULL,
	"status" "RewardStatus" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"paid_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "agent_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"business_id" text NOT NULL,
	"total_volume_usd" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_transaction_count" integer DEFAULT 0 NOT NULL,
	"last_aggregated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"password" text NOT NULL,
	"invite_code" text NOT NULL,
	"status" "AgentStatus" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_attributions" ADD CONSTRAINT "agent_attributions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_attributions" ADD CONSTRAINT "agent_attributions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_reward_ledger" ADD CONSTRAINT "agent_reward_ledger_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_summaries" ADD CONSTRAINT "agent_summaries_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_summaries" ADD CONSTRAINT "agent_summaries_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "agent_attributions_agent_id_idx" ON "agent_attributions" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "agent_attributions_business_id_idx" ON "agent_attributions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agent_attributions_business_id_key" ON "agent_attributions" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "agent_reward_ledger_agent_id_idx" ON "agent_reward_ledger" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "agent_summaries_agent_id_idx" ON "agent_summaries" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "agent_summaries_business_id_idx" ON "agent_summaries" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agent_summaries_agent_business_key" ON "agent_summaries" USING btree ("agent_id" text_ops,"business_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agents_email_key" ON "agents" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agents_invite_code_key" ON "agents" USING btree ("invite_code" text_ops);