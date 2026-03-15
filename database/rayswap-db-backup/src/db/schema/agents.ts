import { pgTable, text, timestamp, numeric, integer, foreignKey, index, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { agentStatus, rewardStatus, businesses, agentPayoutStatus } from "./schema";
import { encryptedText } from "../custom-types";

export const agents = pgTable("agents", {
    id: text().primaryKey().notNull(),
    email: text().notNull(),
    firstName: encryptedText("firstName").notNull(),
    lastName: encryptedText("lastName").notNull(),
    password: text().notNull(),
    inviteCode: text("invite_code").notNull(),
    status: agentStatus().default('PENDING').notNull(),
    emailVerificationSentAt: timestamp("email_verification_sent_at", { precision: 3, mode: 'string' }),
    emailVerificationToken: text("email_verification_token"),
    emailVerificationTokenExpires: timestamp("email_verification_token_expires", { precision: 3, mode: 'string' }),
    emailVerified: boolean("email_verified").default(false).notNull(),
    bankName: encryptedText("bank_name"),
    accountNumber: encryptedText("account_number"),
    accountName: encryptedText("account_name"),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    uniqueIndex("agents_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
    uniqueIndex("agents_invite_code_key").using("btree", table.inviteCode.asc().nullsLast().op("text_ops")),
]);

export const agentAttributions = pgTable("agent_attributions", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    businessId: text("business_id").notNull(),
    attributedAt: timestamp("attributed_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    index("agent_attributions_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    index("agent_attributions_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
    uniqueIndex("agent_attributions_business_id_key").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_attributions_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "agent_attributions_business_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentRewardLedger = pgTable("agent_reward_ledger", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    milestoneUsdAmount: numeric("milestone_usd_amount", { precision: 18, scale: 2 }).notNull(),
    rewardNgnAmount: numeric("reward_ngn_amount", { precision: 18, scale: 2 }).notNull(),
    fxRateUsed: numeric("fx_rate_used", { precision: 18, scale: 8 }).notNull(),
    status: rewardStatus().default('PENDING').notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    paidAt: timestamp("paid_at", { precision: 3, mode: 'string' }),
}, (table) => [
    index("agent_reward_ledger_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_reward_ledger_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentSummaries = pgTable("agent_summaries", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    businessId: text("business_id").notNull(),
    totalVolumeUsd: numeric("total_volume_usd", { precision: 18, scale: 2 }).default('0').notNull(),
    totalTransactionCount: integer("total_transaction_count").default(0).notNull(),
    lastAggregatedAt: timestamp("last_aggregated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    index("agent_summaries_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    index("agent_summaries_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
    uniqueIndex("agent_summaries_agent_business_key").using("btree", table.agentId.asc().nullsLast().op("text_ops"), table.businessId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_summaries_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "agent_summaries_business_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentPayoutRequests = pgTable("agent_payout_requests", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    amountNgn: numeric("amount_ngn", { precision: 18, scale: 2 }).notNull(),
    status: agentPayoutStatus().default('PENDING').notNull(),
    bankName: encryptedText("bank_name").notNull(),
    accountNumber: encryptedText("account_number").notNull(),
    accountName: encryptedText("account_name").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
    paidAt: timestamp("paid_at", { precision: 3, mode: 'string' }),
    adminNotes: encryptedText("admin_notes"),
}, (table) => [
    index("agent_payout_requests_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_payout_requests_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentAchievements = pgTable("agent_achievements", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    achievementType: text("achievement_type").notNull(), // e.g. 'FIRST_MERCHANT', 'FIRST_50K_EARNED'
    unlockedAt: timestamp("unlocked_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    metadata: text("metadata"), // Optional additional info
}, (table) => [
    index("agent_achievements_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    uniqueIndex("agent_achievements_agent_type_key").using("btree", table.agentId.asc().nullsLast().op("text_ops"), table.achievementType.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_achievements_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentLevels = pgTable("agent_levels", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    level: text("level").default('BRONZE').notNull(), // BRONZE, SILVER, GOLD, PLATINUM
    points: integer("points").default(0).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    index("agent_levels_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    uniqueIndex("agent_levels_agent_id_key").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_levels_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const agentProgressSnapshots = pgTable("agent_progress_snapshots", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    totalVolumeUsd: numeric("total_volume_usd", { precision: 18, scale: 2 }).default('0').notNull(),
    totalRewardsNgn: numeric("total_rewards_ngn", { precision: 18, scale: 2 }).default('0').notNull(),
    activeMerchantsCount: integer("active_merchants_count").default(0).notNull(),
    snapshotDate: timestamp("snapshot_date", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    index("agent_progress_snapshots_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_progress_snapshots_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
export const agentBankAccounts = pgTable("agent_bank_accounts", {
    id: text().primaryKey().notNull(),
    agentId: text("agent_id").notNull(),
    bankName: encryptedText("bank_name").notNull(),
    accountNumber: encryptedText("account_number").notNull(),
    accountName: encryptedText("account_name").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
    index("agent_bank_accounts_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.agentId],
        foreignColumns: [agents.id],
        name: "agent_bank_accounts_agent_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
