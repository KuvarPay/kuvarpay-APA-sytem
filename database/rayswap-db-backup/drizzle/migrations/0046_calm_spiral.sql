ALTER TABLE "sandbox_transactions" DROP CONSTRAINT "sandbox_transactions_coachingPaymentLinkId_fkey";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_coachingPaymentLinkId_fkey";
--> statement-breakpoint
ALTER TABLE "coaching_student_requests" ALTER COLUMN "coaching_payment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sandbox_coaching_student_requests" ALTER COLUMN "coaching_payment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "coaching_student_requests" ADD COLUMN "subscription_link_id" text;--> statement-breakpoint
ALTER TABLE "sandbox_coaching_student_requests" ADD COLUMN "subscription_link_id" text;--> statement-breakpoint
ALTER TABLE "coaching_student_requests" ADD CONSTRAINT "coaching_student_requests_subscriptionLinkId_fkey" FOREIGN KEY ("subscription_link_id") REFERENCES "public"."subscription_links"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_coaching_student_requests" ADD CONSTRAINT "sandbox_coaching_student_requests_subscriptionLinkId_fkey" FOREIGN KEY ("subscription_link_id") REFERENCES "public"."sandbox_subscription_links"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" DROP COLUMN "coaching_payment_link_id";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "coaching_payment_link_id";