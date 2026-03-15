CREATE TYPE "public"."PosDeviceStatus" AS ENUM('ACTIVE', 'REVOKED');--> statement-breakpoint
CREATE TABLE "pos_devices" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"device_name" text NOT NULL,
	"device_secret_hash" text NOT NULL,
	"status" "PosDeviceStatus" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"revoked_at" timestamp(3),
	"last_seen_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "pos_link_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp(3) NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "pos_device_id" text;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "pos_device_id" text;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD COLUMN "pos_device_id" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "pos_device_id" text;--> statement-breakpoint
ALTER TABLE "pos_devices" ADD CONSTRAINT "pos_devices_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "pos_link_tokens" ADD CONSTRAINT "pos_link_tokens_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "pos_devices_business_id_idx" ON "pos_devices" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "pos_link_tokens_business_id_idx" ON "pos_link_tokens" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_sessions_pos_device_id" ON "checkout_sessions" USING btree ("pos_device_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_checkout_sessions_pos_device_id" ON "sandbox_checkout_sessions" USING btree ("pos_device_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_transactions_pos_device_id" ON "sandbox_transactions" USING btree ("pos_device_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_pos_device_id" ON "transactions" USING btree ("pos_device_id" text_ops);