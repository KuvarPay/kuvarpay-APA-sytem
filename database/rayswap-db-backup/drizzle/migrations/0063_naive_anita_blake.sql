ALTER TYPE "public"."CampaignStatus" ADD VALUE 'TESTING' BEFORE 'COMPLETED';--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "ab_test_settings" jsonb;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "test_recipient_list" jsonb;