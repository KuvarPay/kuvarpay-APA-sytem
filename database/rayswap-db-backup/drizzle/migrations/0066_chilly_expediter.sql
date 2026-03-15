CREATE TYPE "public"."TwoFactorMethod" AS ENUM('TOTP', 'EMAIL');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "twoFactorMethod" "TwoFactorMethod" DEFAULT 'TOTP' NOT NULL;