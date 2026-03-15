ALTER TABLE "businesses" ALTER COLUMN "uboDeclaration" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "businesses" ALTER COLUMN "director_declaration" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ALTER COLUMN "result" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "kyc_verifications" ALTER COLUMN "idInfo" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment_methods" ALTER COLUMN "metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sandbox_customers" ALTER COLUMN "metadata" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "support_tickets" ALTER COLUMN "metadata" SET DATA TYPE text;