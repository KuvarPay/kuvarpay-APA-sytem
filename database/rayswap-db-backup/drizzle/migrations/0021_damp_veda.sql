CREATE TYPE "public"."SubscriptionLinkStatus" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "sandbox_subscription_links" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "SubscriptionLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp(3),
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_links" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"subscription_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "SubscriptionLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp(3),
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sandbox_subscription_links" ADD CONSTRAINT "sandbox_subscription_links_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_subscription_links" ADD CONSTRAINT "sandbox_subscription_links_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_links" ADD CONSTRAINT "subscription_links_businessId_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_links" ADD CONSTRAINT "subscription_links_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_links_slug_key" ON "sandbox_subscription_links" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_links_business_id_idx" ON "sandbox_subscription_links" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_links_subscription_id_idx" ON "sandbox_subscription_links" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_links_status_idx" ON "sandbox_subscription_links" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_links_slug_key" ON "subscription_links" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_links_business_id_idx" ON "subscription_links" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_links_subscription_id_idx" ON "subscription_links" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_links_status_idx" ON "subscription_links" USING btree ("status" enum_ops);