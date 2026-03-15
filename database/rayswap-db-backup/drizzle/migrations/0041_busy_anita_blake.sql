CREATE TYPE "public"."CoachingStudentRequestStatus" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
ALTER TYPE "public"."UserType" ADD VALUE 'COACH';--> statement-breakpoint
CREATE TABLE "coaching_student_requests" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coaching_payment_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"status" "CoachingStudentRequestStatus" DEFAULT 'pending' NOT NULL,
	"unique_token" text NOT NULL,
	"personal_payment_link" text NOT NULL,
	"transaction_id" text,
	"requestedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"paidAt" timestamp(3),
	"lastReminderAt" timestamp(3)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "coaching_student_requests_unique_token_key" ON "coaching_student_requests" USING btree ("unique_token" text_ops);