ALTER TABLE "coaching_payment_links" ADD COLUMN "notification_email" text;--> statement-breakpoint
ALTER TABLE "payment_links" ADD COLUMN "notification_email" text;--> statement-breakpoint
ALTER TABLE "sandbox_coaching_payment_links" ADD COLUMN "notification_email" text;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD COLUMN "notification_email" text;