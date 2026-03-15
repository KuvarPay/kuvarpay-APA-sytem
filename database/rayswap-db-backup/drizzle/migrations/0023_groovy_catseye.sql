CREATE TABLE "sandbox_subscription_authorizations" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" text NOT NULL,
	"auth_id" text NOT NULL,
	"price_id" text NOT NULL,
	"renewal_counter" integer NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp(3) with time zone,
	"revoked_at" timestamp(3)
);
--> statement-breakpoint
ALTER TABLE "sandbox_subscription_authorizations" ADD CONSTRAINT "sandbox_subscription_authorizations_subscriptionId_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."sandbox_subscriptions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_subscription_authorizations_auth_id_key" ON "sandbox_subscription_authorizations" USING btree ("auth_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_authorizations_subscription_id_idx" ON "sandbox_subscription_authorizations" USING btree ("subscription_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_authorizations_price_id_idx" ON "sandbox_subscription_authorizations" USING btree ("price_id" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_authorizations_is_active_idx" ON "sandbox_subscription_authorizations" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "sandbox_subscription_authorizations_expires_at_idx" ON "sandbox_subscription_authorizations" USING btree ("expires_at");