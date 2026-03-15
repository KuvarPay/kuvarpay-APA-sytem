ALTER TABLE "marketing_campaigns" ADD COLUMN "from_name" text;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "from_email" text;--> statement-breakpoint
ALTER TABLE "marketing_campaigns" ADD COLUMN "recipient_list" jsonb;