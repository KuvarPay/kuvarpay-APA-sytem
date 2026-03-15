ALTER TABLE "agents" ADD COLUMN "email_verification_sent_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "email_verification_token" text;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "email_verification_token_expires" timestamp(3);--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;