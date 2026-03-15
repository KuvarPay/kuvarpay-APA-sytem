ALTER TABLE "customers" DROP CONSTRAINT "customers_uid_unique";--> statement-breakpoint
ALTER TABLE "sandbox_customers" DROP CONSTRAINT "sandbox_customers_uid_unique";--> statement-breakpoint
DROP INDEX "customers_uid_key";--> statement-breakpoint
DROP INDEX "sandbox_customers_uid_key";--> statement-breakpoint
ALTER TABLE "customers" DROP COLUMN "uid";--> statement-breakpoint
ALTER TABLE "sandbox_customers" DROP COLUMN "uid";