CREATE TYPE "public"."SupportMessageType" AS ENUM('MESSAGE', 'NOTE', 'SYSTEM');--> statement-breakpoint
CREATE TYPE "public"."SupportTicketCategory" AS ENUM('GENERAL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'COMPLIANCE', 'INTEGRATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."SupportTicketStatus" AS ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER', 'RESOLVED', 'CLOSED', 'ESCALATED');--> statement-breakpoint
CREATE TABLE "support_ticket_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"admin_id" text NOT NULL,
	"assigned_by_admin_id" text,
	"reason" text,
	"active" boolean DEFAULT true NOT NULL,
	"assigned_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"unassigned_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "support_ticket_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"url" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text,
	"size_bytes" integer,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_events" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"event_type" text NOT NULL,
	"actor_admin_id" text,
	"actor_user_id" text,
	"details" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_locks" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"locked_by_admin_id" text NOT NULL,
	"locked_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lock_expires_at" timestamp(3),
	"unlocked_at" timestamp(3),
	"unlock_reason" text
);
--> statement-breakpoint
CREATE TABLE "support_ticket_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"sender_user_id" text,
	"sender_admin_id" text,
	"type" "SupportMessageType" DEFAULT 'MESSAGE' NOT NULL,
	"content" text NOT NULL,
	"content_format" text DEFAULT 'PLAINTEXT',
	"is_internal" boolean DEFAULT false NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"edited_at" timestamp(3),
	"quoted_message_id" text,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_ticket_watchers" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"admin_id" text NOT NULL,
	"added_by_admin_id" text,
	"email_on_new_message" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text,
	"userId" text,
	"subject" text NOT NULL,
	"status" "SupportTicketStatus" DEFAULT 'OPEN' NOT NULL,
	"priority" "NotificationPriority" DEFAULT 'NORMAL' NOT NULL,
	"category" "SupportTicketCategory" DEFAULT 'GENERAL' NOT NULL,
	"assigned_admin_id" text,
	"assigned_at" timestamp(3),
	"assigned_by_admin_id" text,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_by_admin_id" text,
	"locked_at" timestamp(3),
	"lock_expires_at" timestamp(3),
	"messages_count" integer DEFAULT 0 NOT NULL,
	"watchers_count" integer DEFAULT 0 NOT NULL,
	"last_message_at" timestamp(3),
	"last_message_from_role" text,
	"resolved_at" timestamp(3),
	"closed_at" timestamp(3),
	"escalated_at" timestamp(3),
	"escalated_by_admin_id" text,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_ticket_assignments" ADD CONSTRAINT "support_ticket_assignments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_assignments" ADD CONSTRAINT "support_ticket_assignments_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_assignments" ADD CONSTRAINT "support_ticket_assignments_assigned_by_admin_id_fkey" FOREIGN KEY ("assigned_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_attachments" ADD CONSTRAINT "support_ticket_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "public"."support_ticket_messages"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_actor_admin_id_fkey" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_events" ADD CONSTRAINT "support_ticket_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_locks" ADD CONSTRAINT "support_ticket_locks_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_locks" ADD CONSTRAINT "support_ticket_locks_locked_by_admin_id_fkey" FOREIGN KEY ("locked_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_sender_admin_id_fkey" FOREIGN KEY ("sender_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_messages" ADD CONSTRAINT "support_ticket_messages_quoted_message_id_fkey" FOREIGN KEY ("quoted_message_id") REFERENCES "public"."support_ticket_messages"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_watchers" ADD CONSTRAINT "support_ticket_watchers_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_watchers" ADD CONSTRAINT "support_ticket_watchers_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_ticket_watchers" ADD CONSTRAINT "support_ticket_watchers_added_by_admin_id_fkey" FOREIGN KEY ("added_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_by_admin_id_fkey" FOREIGN KEY ("assigned_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_locked_by_admin_id_fkey" FOREIGN KEY ("locked_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_escalated_by_admin_id_fkey" FOREIGN KEY ("escalated_by_admin_id") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "support_ticket_assignments_ticket_id_idx" ON "support_ticket_assignments" USING btree ("ticket_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_assignments_admin_id_idx" ON "support_ticket_assignments" USING btree ("admin_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "support_ticket_assignments_active_unique" ON "support_ticket_assignments" USING btree ("ticket_id" text_ops,"admin_id" text_ops) WHERE "support_ticket_assignments"."active" = true;--> statement-breakpoint
CREATE INDEX "support_ticket_attachments_message_id_idx" ON "support_ticket_attachments" USING btree ("message_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_events_ticket_id_idx" ON "support_ticket_events" USING btree ("ticket_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_events_event_type_idx" ON "support_ticket_events" USING btree ("event_type" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_events_created_at_idx" ON "support_ticket_events" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "support_ticket_locks_ticket_id_idx" ON "support_ticket_locks" USING btree ("ticket_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_locks_locked_by_admin_id_idx" ON "support_ticket_locks" USING btree ("locked_by_admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_messages_ticket_id_idx" ON "support_ticket_messages" USING btree ("ticket_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_messages_sender_admin_idx" ON "support_ticket_messages" USING btree ("sender_admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_messages_sender_user_idx" ON "support_ticket_messages" USING btree ("sender_user_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_messages_created_at_idx" ON "support_ticket_messages" USING btree ("createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "support_ticket_watchers_ticket_admin_unique" ON "support_ticket_watchers" USING btree ("ticket_id" text_ops,"admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_ticket_watchers_admin_id_idx" ON "support_ticket_watchers" USING btree ("admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_status_idx" ON "support_tickets" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets" USING btree ("priority" enum_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_category_idx" ON "support_tickets" USING btree ("category" enum_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_businessId_idx" ON "support_tickets" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_assigned_admin_idx" ON "support_tickets" USING btree ("assigned_admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_locked_admin_idx" ON "support_tickets" USING btree ("locked_by_admin_id" text_ops);--> statement-breakpoint
CREATE INDEX "support_tickets_last_message_at_idx" ON "support_tickets" USING btree ("last_message_at");--> statement-breakpoint
ALTER TABLE "checkout_sessions" DROP COLUMN "callback_url";--> statement-breakpoint
ALTER TABLE "checkout_sessions" DROP COLUMN "redirect_url";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" DROP COLUMN "callback_url";--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" DROP COLUMN "redirect_url";