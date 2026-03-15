CREATE TYPE "public"."ApiCredentialType" AS ENUM('SECRET', 'CLIENT');--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "credentialType" "ApiCredentialType" DEFAULT 'SECRET' NOT NULL;