import { pgTable, text, timestamp, numeric, integer, boolean, jsonb, pgSchema, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { businesses } from "./schema";

export const payrollSchema = pgSchema("payroll");

export const paymentTimingEnum = pgEnum("payment_timing", ["ONE_TIME", "RECURRING"]);
export const payrollStatusEnum = pgEnum("payroll_status", ["PENDING", "FUNDING_REQUIRED", "FUNDED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);
export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", ["CREDIT", "DEBIT"]);

/**
 * Schedules define the intent of a payroll run.
 */
export const payrollSchedules = pgTable("payroll_schedules", {
    id: text("id").primaryKey().notNull(),
    businessId: text("business_id").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(), // e.g., 'SALARY', 'VENDOR', 'CUSTOM'
    customLabel: text("custom_label"),
    timing: paymentTimingEnum("timing").notNull(),
    status: payrollStatusEnum("status").default("PENDING").notNull(),

    // WDK Configuration
    vaultAddress: text("vault_address").notNull(),
    vaultIndex: integer("vault_index").notNull(), // HD index used
    network: text("network").default("tron").notNull(),

    // Recurring details
    cronExpression: text("cron_expression"), // e.g., '0 0 1 * *' for monthly
    nextRunAt: timestamp("next_run_at", { precision: 3, mode: "string" }),

    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" }).notNull(),
}, (table) => [
    foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "payroll_schedules_business_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

/**
 * Batches are individual executions of a schedule.
 */
export const payrollBatches = pgTable("payroll_batches", {
    id: text("id").primaryKey().notNull(),
    scheduleId: text("schedule_id").notNull(),
    status: payrollStatusEnum("status").default("PENDING").notNull(),

    totalAmountFiat: numeric("total_amount_fiat", { precision: 18, scale: 2 }).notNull(),
    totalAmountUsdt: numeric("total_amount_usdt", { precision: 18, scale: 8 }).notNull(),
    currency: text("currency").notNull(),

    recipientCount: integer("recipient_count").notNull(),
    recipients: jsonb("recipients"), // Store the parsed JSON from frontend
    rewardsEarned: numeric("rewards_earned", { precision: 18, scale: 8 }).default("0"),

    executedAt: timestamp("executed_at", { precision: 3, mode: "string" }),
    errorLog: text("error_log"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" }).notNull(),
}, (table) => [
    foreignKey({
        columns: [table.scheduleId],
        foreignColumns: [payrollSchedules.id],
        name: "payroll_batches_schedule_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

/**
 * Internal Shadow Ledger for reconciliation.
 */
export const payrollLedgerEntries = pgTable("payroll_ledger_entries", {
    id: text("id").primaryKey().notNull(),
    scheduleId: text("schedule_id").notNull(),
    batchId: text("batch_id"), // Nullable for general top-ups
    type: ledgerEntryTypeEnum("type").notNull(),
    amountUsdt: numeric("amount_usdt", { precision: 18, scale: 8 }).notNull(),
    description: text("description"),
    txHash: text("tx_hash"), // Blockchain tx hash for credits
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" }).notNull(),
}, (table) => [
    foreignKey({
        columns: [table.scheduleId],
        foreignColumns: [payrollSchedules.id],
        name: "payroll_ledger_entries_schedule_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
    foreignKey({
        columns: [table.batchId],
        foreignColumns: [payrollBatches.id],
        name: "payroll_ledger_entries_batch_id_fkey"
    }).onUpdate("cascade").onDelete("set null"),
]);

/**
 * AI Agent Decision Logs (Audit Trail).
 */
export const payrollAgentDecisions = pgTable("payroll_agent_decisions", {
    id: text("id").primaryKey().notNull(),
    batchId: text("batch_id").notNull(),
    decisionType: text("decision_type").notNull(), // e.g., 'FUNDING_EVALUATION', 'PAYOUT_READY'
    reasoning: text("reasoning").notNull(),
    plan: jsonb("plan"),
    inputData: jsonb("input_data"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" }).notNull(),
}, (table) => [
    foreignKey({
        columns: [table.batchId],
        foreignColumns: [payrollBatches.id],
        name: "payroll_agent_decisions_batch_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
