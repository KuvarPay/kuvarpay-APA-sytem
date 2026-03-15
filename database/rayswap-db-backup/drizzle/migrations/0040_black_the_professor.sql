CREATE TYPE "public"."UserType" AS ENUM('BUSINESS', 'FREELANCER');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "userType" "UserType" DEFAULT 'BUSINESS' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "freelancerActivity" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "freelancerKycData" jsonb;