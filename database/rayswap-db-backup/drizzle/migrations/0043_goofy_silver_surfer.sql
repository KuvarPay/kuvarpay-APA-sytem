CREATE TABLE "coaching_payment_links" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(18, 2),
	"allow_custom_amount" boolean DEFAULT false,
	"min_amount" numeric(18, 2),
	"max_amount" numeric(18, 2),
	"currency" text NOT NULL,
	"settlement_currency" text,
	"fx_applied" boolean DEFAULT false,
	"fx_rate" numeric(18, 8),
	"fx_rate_source" text DEFAULT 'exchangerate-api',
	"fx_rate_fetched_at" timestamp(3),
	"fx_rate_last_update_at" timestamp(3),
	"fx_rate_next_update_at" timestamp(3),
	"settlement_amount" numeric(18, 2),
	"description" text,
	"success_url" text,
	"cancel_url" text,
	"slug" text NOT NULL,
	"status" "PaymentLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expiresAt" timestamp(3),
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_coaching_payment_links" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(18, 2),
	"allow_custom_amount" boolean DEFAULT false,
	"min_amount" numeric(18, 2),
	"max_amount" numeric(18, 2),
	"currency" text NOT NULL,
	"settlement_currency" text,
	"fx_applied" boolean DEFAULT false,
	"fx_rate" numeric(18, 8),
	"fx_rate_source" text DEFAULT 'exchangerate-api',
	"fx_rate_fetched_at" timestamp(3),
	"fx_rate_last_update_at" timestamp(3),
	"fx_rate_next_update_at" timestamp(3),
	"settlement_amount" numeric(18, 2),
	"description" text,
	"success_url" text,
	"cancel_url" text,
	"slug" text NOT NULL,
	"status" "PaymentLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expiresAt" timestamp(3),
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coaching_payment_links" ADD CONSTRAINT "coaching_payment_links_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_coaching_payment_links" ADD CONSTRAINT "sandbox_coaching_payment_links_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "coaching_payment_links_slug_key" ON "coaching_payment_links" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_coaching_payment_links_slug_key" ON "sandbox_coaching_payment_links" USING btree ("slug" text_ops);