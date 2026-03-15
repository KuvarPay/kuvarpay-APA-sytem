ALTER TABLE "businesses" ADD COLUMN "notificationPreference" text DEFAULT 'email_only' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "phoneVerified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "phoneVerifiedAt" timestamp(3);