CREATE TABLE "agent_bank_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_name" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_bank_accounts" ADD CONSTRAINT "agent_bank_accounts_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "agent_bank_accounts_agent_id_idx" ON "agent_bank_accounts" USING btree ("agent_id" text_ops);