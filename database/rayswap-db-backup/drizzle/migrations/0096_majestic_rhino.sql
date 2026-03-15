CREATE SCHEMA "payroll";
--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('CREDIT', 'DEBIT');--> statement-breakpoint
CREATE TYPE "public"."payment_timing" AS ENUM('ONE_TIME', 'RECURRING');--> statement-breakpoint
CREATE TYPE "public"."payroll_status" AS ENUM('PENDING', 'FUNDING_REQUIRED', 'FUNDED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "payroll_agent_decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"decision_type" text NOT NULL,
	"reasoning" text NOT NULL,
	"plan" jsonb,
	"input_data" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_batches" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"status" "payroll_status" DEFAULT 'PENDING' NOT NULL,
	"total_amount_fiat" numeric(18, 2) NOT NULL,
	"total_amount_usdt" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"recipient_count" integer NOT NULL,
	"recipients" jsonb,
	"rewards_earned" numeric(18, 8) DEFAULT '0',
	"executed_at" timestamp(3),
	"error_log" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"schedule_id" text NOT NULL,
	"batch_id" text,
	"type" "ledger_entry_type" NOT NULL,
	"amount_usdt" numeric(18, 8) NOT NULL,
	"description" text,
	"tx_hash" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"custom_label" text,
	"timing" "payment_timing" NOT NULL,
	"status" "payroll_status" DEFAULT 'PENDING' NOT NULL,
	"vault_address" text NOT NULL,
	"vault_index" integer NOT NULL,
	"network" text DEFAULT 'tron' NOT NULL,
	"cron_expression" text,
	"next_run_at" timestamp(3),
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payroll_agent_decisions" ADD CONSTRAINT "payroll_agent_decisions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."payroll_batches"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_batches" ADD CONSTRAINT "payroll_batches_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."payroll_schedules"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_ledger_entries" ADD CONSTRAINT "payroll_ledger_entries_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."payroll_schedules"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_ledger_entries" ADD CONSTRAINT "payroll_ledger_entries_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."payroll_batches"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payroll_schedules" ADD CONSTRAINT "payroll_schedules_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;