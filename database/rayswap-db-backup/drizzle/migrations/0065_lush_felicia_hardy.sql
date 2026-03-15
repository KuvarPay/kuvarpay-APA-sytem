ALTER TABLE "marketing_triggers" ALTER COLUMN "event" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."TriggerEvent";--> statement-breakpoint
CREATE TYPE "public"."TriggerEvent" AS ENUM('USER_REGISTERED', 'INCOMPLETE_ONBOARDING', 'NO_ACTIVITY_7_DAYS', 'NO_ACTIVITY_30_DAYS', 'MILESTONE_30_DAYS', 'MILESTONE_60_DAYS', 'MILESTONE_90_DAYS', 'KYC_PENDING_3_DAYS');--> statement-breakpoint
ALTER TABLE "marketing_triggers" ALTER COLUMN "event" SET DATA TYPE "public"."TriggerEvent" USING "event"::"public"."TriggerEvent";--> statement-breakpoint
ALTER TABLE "marketing_triggers" ADD COLUMN "stats" jsonb DEFAULT '{"sent":0,"delivered":0,"opened":0,"clicked":0,"bounced":0,"unsubscribed":0}'::jsonb;