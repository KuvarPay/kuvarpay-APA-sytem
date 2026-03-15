CREATE TABLE "waitlist" (
	"id" text PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"industry" text,
	"country" text,
	"business_type" text,
	"monthly_volume" text,
	"payment_methods" text[],
	"interests" text[],
	"additional_info" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "waitlist_created_at_idx" ON "waitlist" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "waitlist_country_idx" ON "waitlist" USING btree ("country" text_ops);--> statement-breakpoint
CREATE INDEX "waitlist_industry_idx" ON "waitlist" USING btree ("industry" text_ops);