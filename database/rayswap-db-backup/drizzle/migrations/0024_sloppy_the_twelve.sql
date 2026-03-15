ALTER TABLE "sandbox_subscription_authorizations" ALTER COLUMN "price_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_authorizations" ALTER COLUMN "price_id" DROP NOT NULL;