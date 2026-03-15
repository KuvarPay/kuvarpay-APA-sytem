CREATE TYPE "public"."CampaignStatus" AS ENUM('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'FAILED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."MarketingEventType" AS ENUM('SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED', 'COMPLAINED');--> statement-breakpoint
CREATE TYPE "public"."TriggerEvent" AS ENUM('USER_REGISTERED', 'NO_ACTIVITY_7_DAYS', 'NO_ACTIVITY_30_DAYS', 'MILESTONE_30_DAYS', 'MILESTONE_60_DAYS', 'MILESTONE_90_DAYS', 'SUBSCRIPTION_EXPIRED', 'KYC_PENDING_3_DAYS');--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"subject" text,
	"content" text NOT NULL,
	"design" jsonb,
	"variables" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"template_id" text,
	"status" "CampaignStatus" DEFAULT 'DRAFT' NOT NULL,
	"scheduled_at" timestamp(3),
	"query" jsonb,
	"stats" jsonb DEFAULT '{"sent":0,"opened":0,"clicked":0,"bounced":0,"unsubscribed":0}'::jsonb,
	"created_by" text NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_events" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text,
	"trigger_id" text,
	"recipient_email" text NOT NULL,
	"recipient_id" text,
	"type" "MarketingEventType" NOT NULL,
	"metadata" jsonb,
	"occurred_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"user_agent" text,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "marketing_triggers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"event" "TriggerEvent" NOT NULL,
	"template_id" text NOT NULL,
	"delay_minutes" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subject" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketing_unsubscribes" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"reason" text,
	"campaign_id" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "marketing_unsubscribes_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_events" ADD CONSTRAINT "marketing_events_campaign_id_marketing_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."marketing_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_events" ADD CONSTRAINT "marketing_events_trigger_id_marketing_triggers_id_fk" FOREIGN KEY ("trigger_id") REFERENCES "public"."marketing_triggers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_triggers" ADD CONSTRAINT "marketing_triggers_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;