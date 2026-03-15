CREATE TABLE "flutterwave_bank_branches" (
	"id" text PRIMARY KEY NOT NULL,
	"flutterwave_bank_id" text NOT NULL,
	"branch_id" text NOT NULL,
	"code" text,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flutterwave_bank_branches" ADD CONSTRAINT "flutterwave_bank_branches_flutterwave_bank_id_fkey" FOREIGN KEY ("flutterwave_bank_id") REFERENCES "public"."flutterwave_banks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "fw_bank_branches_branch_bank_unique" ON "flutterwave_bank_branches" USING btree ("branch_id" text_ops,"flutterwave_bank_id" text_ops);--> statement-breakpoint
CREATE INDEX "fw_bank_branches_bank_idx" ON "flutterwave_bank_branches" USING btree ("flutterwave_bank_id" text_ops);