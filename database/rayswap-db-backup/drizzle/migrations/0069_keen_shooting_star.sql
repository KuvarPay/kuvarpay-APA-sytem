ALTER TABLE "smile_id_verifications" RENAME TO "kyc_verifications";--> statement-breakpoint
ALTER TABLE "kyc_verifications" DROP CONSTRAINT "smile_id_verifications_businessId_fkey";
--> statement-breakpoint
ALTER TABLE "kyc_verifications" DROP CONSTRAINT "smile_id_verifications_userId_fkey";
--> statement-breakpoint
DROP INDEX "smile_id_verifications_businessId_idx";--> statement-breakpoint
DROP INDEX "smile_id_verifications_jobId_idx";--> statement-breakpoint
DROP INDEX "smile_id_verifications_jobId_key";--> statement-breakpoint
DROP INDEX "smile_id_verifications_status_idx";--> statement-breakpoint
DROP INDEX "smile_id_verifications_userId_idx";--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "kyc_verified_at" timestamp(3);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "kyc_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "kyc_provider" text;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD COLUMN "providerUserId" text;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD COLUMN "provider" text NOT NULL;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "kyc_verifications_businessId_idx" ON "kyc_verifications" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "kyc_verifications_jobId_idx" ON "kyc_verifications" USING btree ("jobId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "kyc_verifications_jobId_key" ON "kyc_verifications" USING btree ("jobId" text_ops);--> statement-breakpoint
CREATE INDEX "kyc_verifications_status_idx" ON "kyc_verifications" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "kyc_verifications_userId_idx" ON "kyc_verifications" USING btree ("userId" text_ops);--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN "smileIdVerificationDate";--> statement-breakpoint
ALTER TABLE "businesses" DROP COLUMN "smileIdVerified";--> statement-breakpoint
ALTER TABLE "kyc_verifications" DROP COLUMN "smileUserId";