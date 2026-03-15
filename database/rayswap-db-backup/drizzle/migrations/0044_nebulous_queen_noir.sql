CREATE TABLE "sandbox_coaching_student_requests" (
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
ALTER TABLE "sandbox_coaching_student_requests" ADD CONSTRAINT "sandbox_coaching_student_requests_coachingPaymentId_fkey" FOREIGN KEY ("coaching_payment_id") REFERENCES "public"."sandbox_coaching_payment_links"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_coaching_student_requests_unique_token_key" ON "sandbox_coaching_student_requests" USING btree ("unique_token" text_ops);--> statement-breakpoint
ALTER TABLE "coaching_student_requests" ADD CONSTRAINT "coaching_student_requests_coachingPaymentId_fkey" FOREIGN KEY ("coaching_payment_id") REFERENCES "public"."coaching_payment_links"("id") ON DELETE cascade ON UPDATE cascade;