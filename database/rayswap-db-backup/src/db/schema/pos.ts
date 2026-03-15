import { pgTable, foreignKey, text, timestamp, boolean, index, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { encryptedText } from "../custom-types"
import { businesses } from "./schema"

export const posDeviceStatus = pgEnum("PosDeviceStatus", ['ACTIVE', 'REVOKED'])

export const posLinkTokens = pgTable("pos_link_tokens", {
    id: text().primaryKey().notNull(),
    businessId: text("business_id").notNull(),
    tokenHash: encryptedText("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
    used: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
    index("pos_link_tokens_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "pos_link_tokens_business_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);

export const posDevices = pgTable("pos_devices", {
    id: text().primaryKey().notNull(),
    businessId: text("business_id").notNull(),
    deviceName: text("device_name").notNull(),
    deviceSecretHash: encryptedText("device_secret_hash").notNull(),
    status: posDeviceStatus().default('ACTIVE').notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    revokedAt: timestamp("revoked_at", { precision: 3, mode: 'string' }),
    lastSeenAt: timestamp("last_seen_at", { precision: 3, mode: 'string' }),
    isSandbox: boolean("is_sandbox").default(false).notNull(),
}, (table) => [
    index("pos_devices_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
    foreignKey({
        columns: [table.businessId],
        foreignColumns: [businesses.id],
        name: "pos_devices_business_id_fkey"
    }).onUpdate("cascade").onDelete("cascade"),
]);
