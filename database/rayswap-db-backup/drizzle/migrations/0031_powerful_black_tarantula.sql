ALTER TABLE "subscription_invoices" ADD COLUMN "settlement_id" text;--> statement-breakpoint
ALTER TABLE "subscription_invoices" ADD CONSTRAINT "subscription_invoices_settlementId_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."settlements"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "subscription_invoices_settlement_id_idx" ON "subscription_invoices" USING btree ("settlement_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_invoices_paid_at_idx" ON "subscription_invoices" USING btree ("paid_at" timestamptz_ops);