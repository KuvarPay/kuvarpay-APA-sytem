-- 0039_restore_customer_identity_in_checkout.sql
-- Purpose: Re-add customer identity fields to checkout sessions tables
-- Context: Columns were dropped in 0038_workable_nighthawk.sql; this restores them.

-- Production table
ALTER TABLE "checkout_sessions" ADD COLUMN "customer_name" text;
ALTER TABLE "checkout_sessions" ADD COLUMN "customer_email" text;

-- Sandbox table
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "customer_name" text;
ALTER TABLE "sandbox_checkout_sessions" ADD COLUMN "customer_email" text;