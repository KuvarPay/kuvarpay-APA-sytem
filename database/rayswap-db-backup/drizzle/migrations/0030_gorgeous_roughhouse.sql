ALTER TABLE "users" ADD COLUMN "suspendedAt" timestamp(3);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isActive" boolean DEFAULT true NOT NULL;