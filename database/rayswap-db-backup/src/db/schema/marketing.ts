import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { encryptedText, encryptedJson } from "../custom-types"

export const campaignStatus = pgEnum("CampaignStatus", ['DRAFT', 'SCHEDULED', 'SENDING', 'PAUSED', 'TESTING', 'COMPLETED', 'FAILED', 'ARCHIVED'])
export const marketingEventType = pgEnum("MarketingEventType", ['SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'UNSUBSCRIBED', 'COMPLAINED'])
export const triggerEvent = pgEnum("TriggerEvent", [
  'USER_REGISTERED',
  'INCOMPLETE_ONBOARDING',
  'NO_ACTIVITY_7_DAYS',
  'NO_ACTIVITY_30_DAYS',
  'MILESTONE_30_DAYS',
  'MILESTONE_60_DAYS',
  'MILESTONE_90_DAYS',
  'KYC_PENDING_3_DAYS'
])

export const emailTemplates = pgTable("email_templates", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject"), // Default subject
  content: text("content").notNull(), // HTML content
  design: jsonb("design"), // JSON representation for drag-and-drop editor if used
  variables: jsonb("variables"), // List of available variables like {{name}}
  createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
})

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  templateId: text("template_id").references(() => emailTemplates.id),
  fromName: text("from_name"), // Sender name
  fromEmail: text("from_email"), // Sender email
  status: campaignStatus("status").default('DRAFT').notNull(),
  scheduledAt: timestamp("scheduled_at", { precision: 3, mode: 'string' }),
  query: jsonb("query"), // Recipient filter criteria
  recipientList: encryptedJson("recipient_list"),
  stats: jsonb("stats").default({ sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }),
  abSubjects: jsonb("ab_subjects"), // List of subject line variants for A/B testing
  abTestSettings: jsonb("ab_test_settings"), // settings for partial testing (size, type, etc)
  testRecipientList: encryptedJson("test_recipient_list"), // stores the full list of recipients to pick from
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
})

export const marketingTriggers = pgTable("marketing_triggers", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  event: triggerEvent("event").notNull(),
  templateId: text("template_id").references(() => emailTemplates.id).notNull(),
  delayMinutes: integer("delay_minutes").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  subject: text("subject"), // Override template subject
  contentType: text("content_type").default('html').notNull(),
  stats: jsonb("stats").default({ sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }),
  createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
})

export const marketingEvents = pgTable("marketing_events", {
  id: text("id").primaryKey().notNull(),
  campaignId: text("campaign_id").references(() => marketingCampaigns.id),
  triggerId: text("trigger_id").references(() => marketingTriggers.id),
  recipientEmail: text("recipient_email").notNull(),
  recipientId: text("recipient_id"), // User ID if available
  type: marketingEventType("type").notNull(),
  metadata: jsonb("metadata"), // Store clicked link, etc.
  occurredAt: timestamp("occurred_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  userAgent: text("user_agent"),
  ipAddress: encryptedText("ip_address"),
})

export const marketingUnsubscribes = pgTable("marketing_unsubscribes", {
  id: text("id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  reason: text("reason"),
  campaignId: text("campaign_id"),
  createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
})
