ALTER TABLE "sandbox_subscription_links" RENAME COLUMN "subscription_id" TO "plan_id";--> statement-breakpoint
ALTER TABLE "subscription_links" RENAME COLUMN "subscription_id" TO "plan_id";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_links" DROP CONSTRAINT "sandbox_subscription_links_subscriptionId_fkey";
--> statement-breakpoint
ALTER TABLE "subscription_links" DROP CONSTRAINT "subscription_links_subscriptionId_fkey";
--> statement-breakpoint
DROP INDEX "sandbox_subscription_links_subscription_id_idx";--> statement-breakpoint
DROP INDEX "subscription_links_subscription_id_idx";--> statement-breakpoint
ALTER TABLE "sandbox_subscription_links" ADD CONSTRAINT "sandbox_subscription_links_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."sandbox_subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_links" ADD CONSTRAINT "subscription_links_planId_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "sandbox_subscription_links_plan_id_idx" ON "sandbox_subscription_links" USING btree ("plan_id" text_ops);--> statement-breakpoint
CREATE INDEX "subscription_links_plan_id_idx" ON "subscription_links" USING btree ("plan_id" text_ops);