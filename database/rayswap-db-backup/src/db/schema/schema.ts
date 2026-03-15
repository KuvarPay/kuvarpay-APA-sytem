import { pgTable, uniqueIndex, foreignKey, text, timestamp, numeric, integer, boolean, index, jsonb, doublePrecision, serial, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { encryptedText, encryptedJson } from "../custom-types"

export const adminRole = pgEnum("AdminRole", ['ADMIN', 'SUPER_ADMIN'])
export const apiKeyStatus = pgEnum("ApiKeyStatus", ['ACTIVE', 'INACTIVE'])
export const apiKeyType = pgEnum("ApiKeyType", ['LIVE', 'SANDBOX'])
export const apiCredentialType = pgEnum("ApiCredentialType", ["SECRET", "CLIENT"]);
export const checkoutStatus = pgEnum("CheckoutStatus", ['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'PROCESSING', 'FAILED', 'PARTIAL_PAYMENT', 'EXCESS_PAYMENT', 'ARMED', 'EXPIRED_WITH_PAYMENT_PROCESSING', 'COMPLIANCE_HOLD', 'REFUNDED'])
export const documentStatus = pgEnum("DocumentStatus", ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'])
export const documentType = pgEnum("DocumentType", ['BUSINESS_REGISTRATION', 'TAX_CERTIFICATE', 'BANK_STATEMENT', 'IDENTITY_DOCUMENT', 'PROOF_OF_ADDRESS', 'MEMORANDUM', 'ARTICLES_OF_INCORPORATION', 'DIRECTORS_RESOLUTION', 'BENEFICIAL_OWNERSHIP', 'OTHER'])
export const gasFundingStatus = pgEnum("GasFundingStatus", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NOT_NEEDED'])
export const invoiceStatus = pgEnum("InvoiceStatus", ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'])
export const notificationPriority = pgEnum("NotificationPriority", ['LOW', 'NORMAL', 'MEDIUM', 'HIGH', 'URGENT'])
export const notificationType = pgEnum("NotificationType", ['TRANSACTION', 'PAYMENT', 'SETTLEMENT', 'SECURITY', 'SYSTEM', 'BUSINESS', 'VERIFICATION', 'WEBHOOK', 'API'])
export const onboardingStatus = pgEnum("OnboardingStatus", ['PENDING', 'IN_PROGRESS', 'COMPLETED'])
export const paymentLinkStatus = pgEnum("PaymentLinkStatus", ['ACTIVE', 'INACTIVE', 'EXPIRED'])
export const payoutStatus = pgEnum("PayoutStatus", ['PENDING', 'PROCESSING', 'PAID', 'FAILED'])
export const settlementAccountType = pgEnum("SettlementAccountType", ['BANK_TRANSFER', 'MOBILE_MONEY', 'CRYPTO'])
export const settlementPayoutStatus = pgEnum("SettlementPayoutStatus", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'])
export const settlementStatus = pgEnum("SettlementStatus", ['PENDING', 'PROCESSING', 'HOLD', 'COMPLETED', 'FAILED'])
export const cryptoAsset = pgEnum("CryptoAsset", ['USDT', 'USDC'])
export const cryptoNetwork = pgEnum("CryptoNetwork", ['BEP20', 'POLYGON'])
export const preferredSettlementTypeEnum = pgEnum("PreferredSettlementType", ['FIAT', 'CRYPTO'])
export const teamMemberStatus = pgEnum("TeamMemberStatus", ['PENDING', 'ACTIVE', 'INACTIVE'])
export const teamRole = pgEnum("TeamRole", ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'DEVELOPER', 'SUPPORT'])
export const transactionStatus = pgEnum("TransactionStatus", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'PARTIAL_PAYMENT', 'EXCESS_PAYMENT', 'COMPLIANCE_HOLD', 'REFUNDED'])
export const verificationStatus = pgEnum("VerificationStatus", ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'])
export const webhookStatus = pgEnum("WebhookStatus", ['ACTIVE', 'INACTIVE'])
export const sweepStatus = pgEnum("SweepStatus", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED'])
export const exchangeDepositStatus = pgEnum("ExchangeDepositStatus", ['PENDING', 'CONFIRMED', 'LIQUIDATED', 'FAILED'])
export const userType = pgEnum("UserType", ['BUSINESS', 'FREELANCER', 'COACH'])
export const coachingStudentRequestStatus = pgEnum("CoachingStudentRequestStatus", ['pending', 'paid', 'failed'])
export const agentStatus = pgEnum("AgentStatus", ['PENDING', 'APPROVED', 'REJECTED'])
export const rewardStatus = pgEnum("RewardStatus", ['PENDING', 'PAID'])
export const agentPayoutStatus = pgEnum("AgentPayoutStatus", ['PENDING', 'PAID', 'REJECTED'])
export const refundStatus = pgEnum("RefundStatus", ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])

// Subscription-related enums
export const subscriptionStatus = pgEnum("SubscriptionStatus", ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE', 'INCOMPLETE_EXPIRED'])
export const subscriptionInvoiceStatus = pgEnum("SubscriptionInvoiceStatus", ['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE'])
export const chargeStatus = pgEnum("ChargeStatus", ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED'])
export const paymentMethodType = pgEnum("PaymentMethodType", ['CRYPTO_WALLET', 'BANK_TRANSFER', 'MOBILE_MONEY'])
export const billingInterval = pgEnum("BillingInterval", ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY'])
export const billingMode = pgEnum("BillingMode", ['FIXED', 'METERED'])
export const subscriptionLinkStatus = pgEnum("SubscriptionLinkStatus", ['ACTIVE', 'INACTIVE', 'EXPIRED'])
export const twoFactorMethod = pgEnum("TwoFactorMethod", ['TOTP', 'EMAIL'])


// Ledger-related enums
export const ledgerAccountType = pgEnum("LedgerAccountType", ['MERCHANT', 'PLATFORM_REVENUE', 'ESCROW', 'FEES', 'SETTLEMENT'])
export const ledgerEntryType = pgEnum("LedgerEntryType", ['CREDIT', 'DEBIT'])

// Support system enums
export const supportTicketStatus = pgEnum("SupportTicketStatus", [
	'OPEN',
	'ASSIGNED',
	'IN_PROGRESS',
	'PENDING_USER',
	'RESOLVED',
	'CLOSED',
	'ESCALATED'
])

export const supportTicketCategory = pgEnum("SupportTicketCategory", [
	'GENERAL',
	'BILLING',
	'TECHNICAL',
	'ACCOUNT',
	'COMPLIANCE',
	'INTEGRATION',
	'OTHER'
])

export const supportMessageType = pgEnum("SupportMessageType", [
	'MESSAGE',
	'NOTE',
	'SYSTEM'
])

export const blogStatus = pgEnum("BlogStatus", ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'])


export const teamMembers = pgTable("team_members", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	userId: text().notNull(),
	role: teamRole().default('MEMBER').notNull(),
	status: teamMemberStatus().default('PENDING').notNull(),
	invitedBy: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("team_members_businessId_userId_key").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "team_members_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "team_members_userId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const invoices = pgTable("invoices", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	customerName: encryptedText("customerName").notNull(),
	customerEmail: encryptedText("customerEmail").notNull(),
	amount: numeric({ precision: 18, scale: 2 }).notNull(),
	discount: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	currency: text().notNull(),
	// FX fields captured at creation time when customer currency differs from business local currency
	settlementCurrency: text("settlement_currency"), // snapshot of business currency at creation
	fxApplied: boolean("fx_applied").default(false), // whether FX was involved during creation
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }), // rate to convert from settlement_currency (base) -> currency (target)
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	// Persisted settlement amount snapshot (amount in settlement currency at creation)
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: encryptedText("description"),
	status: invoiceStatus().default('DRAFT').notNull(),
	dueDate: timestamp({ precision: 3, mode: 'string' }),
	paidAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	invoiceNumber: text(),
	notes: text(),
}, (table) => [
	uniqueIndex("invoices_invoiceNumber_key").using("btree", table.invoiceNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "invoices_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const paymentLinks = pgTable("payment_links", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	title: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }),
	// When true, customer can input any amount between minAmount and maxAmount
	allowCustomAmount: boolean("allow_custom_amount").default(false),
	minAmount: numeric("min_amount", { precision: 18, scale: 2 }),
	maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
	currency: text().notNull(),
	// FX fields captured at creation time when customer currency differs from business local currency
	settlementCurrency: text("settlement_currency"), // snapshot of business currency at creation
	fxApplied: boolean("fx_applied").default(false), // whether FX was involved during creation
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }), // rate to convert from settlement_currency (base) -> currency (target)
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	// Persisted settlement amount snapshot (amount in settlement currency at creation)
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: text(),
	// Optional URLs for success and cancel redirects
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	slug: text().notNull(),
	status: paymentLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	metadata: jsonb("metadata"),
	notificationEmail: text("notification_email"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("payment_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "payment_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const coachingPaymentLinks = pgTable("coaching_payment_links", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	title: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }),
	// When true, customer can input any amount between minAmount and maxAmount
	allowCustomAmount: boolean("allow_custom_amount").default(false),
	minAmount: numeric("min_amount", { precision: 18, scale: 2 }),
	maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
	currency: text().notNull(),
	// FX fields captured at creation time when customer currency differs from business local currency
	settlementCurrency: text("settlement_currency"), // snapshot of business currency at creation
	fxApplied: boolean("fx_applied").default(false), // whether FX was involved during creation
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }), // rate to convert from settlement_currency (base) -> currency (target)
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	// Persisted settlement amount snapshot (amount in settlement currency at creation)
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: text(),
	// Optional URLs for success and cancel redirects
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	slug: text().notNull(),
	status: paymentLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	metadata: jsonb("metadata"),
	notificationEmail: text("notification_email"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("coaching_payment_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "coaching_payment_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxCoachingPaymentLinks = pgTable("sandbox_coaching_payment_links", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	title: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }),
	allowCustomAmount: boolean("allow_custom_amount").default(false),
	minAmount: numeric("min_amount", { precision: 18, scale: 2 }),
	maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
	currency: text().notNull(),
	settlementCurrency: text("settlement_currency"),
	fxApplied: boolean("fx_applied").default(false),
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }),
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: text(),
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	slug: text().notNull(),
	status: paymentLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	metadata: jsonb("metadata"),
	notificationEmail: text("notification_email"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("sandbox_coaching_payment_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_coaching_payment_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const invoiceItems = pgTable("invoice_items", {
	id: text().primaryKey().notNull(),
	invoiceId: text().notNull(),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	unitPrice: numeric({ precision: 18, scale: 2 }).notNull(),
	total: numeric({ precision: 18, scale: 2 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [invoices.id],
		name: "invoice_items_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const settlements = pgTable("settlements", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }).notNull(),
	currency: text().notNull(),
	bankAccount: text().notNull(),
	bankName: text().notNull(),
	bankCode: text(),
	accountName: text(),
	status: settlementStatus().default('PENDING').notNull(),
	transactionCount: integer().default(0).notNull(),
	fees: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	requestedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	processedAt: timestamp({ precision: 3, mode: 'string' }),
	completedAt: timestamp({ precision: 3, mode: 'string' }),
	failureReason: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	payoutMethod: text("payout_method").default('BANK_TRANSFER'),
	requiresAdminApproval: boolean("requires_admin_approval").default(true).notNull(),
	settlementAccountId: text("settlement_account_id"),
	sourceAmount: numeric("source_amount", { precision: 18, scale: 2 }),
	sourceCurrency: text("source_currency"),
	exchangeRate: numeric("exchange_rate", { precision: 18, scale: 8 }),
	cryptoAsset: cryptoAsset("crypto_asset"),
	cryptoNetwork: cryptoNetwork("crypto_network"),
	cryptoAmount: numeric("crypto_amount", { precision: 18, scale: 8 }),
	serviceFeeFiat: numeric("service_fee_fiat", { precision: 18, scale: 2 }),
	networkFeeCrypto: numeric("network_fee_crypto", { precision: 18, scale: 8 }),
}, (table) => [
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "settlements_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.settlementAccountId],
		foreignColumns: [settlementAccounts.id],
		name: "settlements_settlement_account_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const apiKeys = pgTable("api_keys", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	name: text().notNull(),
	keyHash: text().notNull(),
	keyPrefix: text().notNull(),
	status: apiKeyStatus().default("ACTIVE").notNull(),
	credentialType: apiCredentialType().default("SECRET").notNull(),
	permissions: text().array().default(["RAY"]),
	type: apiKeyType().default("LIVE").notNull(),

	lastUsedAt: timestamp({ precision: 3, mode: "string" }),
	createdAt: timestamp({ precision: 3, mode: "string" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: "string" }).notNull(),
	expiresAt: timestamp({ precision: 3, mode: "string" }),
}, (table) => [
	uniqueIndex("api_keys_keyHash_key").using(
		"btree",
		table.keyHash.asc().nullsLast().op("text_ops")
	),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "api_keys_businessId_fkey",
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const webhooks = pgTable("webhooks", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	url: text().notNull(),
	events: text().array(),
	secret: text().notNull(),
	status: webhookStatus().default('ACTIVE').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "webhooks_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	firstName: encryptedText("firstName").notNull(),
	lastName: encryptedText("lastName").notNull(),
	password: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	// Deprecated: use isActive for suspension going forward
	suspendedAt: timestamp({ precision: 3, mode: 'string' }),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	governmentIdDoc: text(),
	role: text(),
	isActive: boolean().default(true).notNull(),
	selfieDoc: text(),
	lastLoginAt: timestamp({ precision: 3, mode: 'string' }),
	emailVerificationSentAt: timestamp({ precision: 3, mode: 'string' }),
	emailVerificationToken: text("emailVerificationToken"),
	emailVerificationTokenExpires: timestamp({ precision: 3, mode: 'string' }),
	emailVerified: boolean().default(false).notNull(),
	twoFactorBackupCodes: text().array().default(["RAY"]),
	twoFactorEnabled: boolean().default(false).notNull(),
	twoFactorMethod: twoFactorMethod().default('TOTP').notNull(),
	twoFactorSecret: text(),

	phone: encryptedText("phone"),
	resetToken: text(),
	resetTokenExpiry: timestamp({ precision: 3, mode: 'string' }),
	userType: userType().default('BUSINESS').notNull(),
	freelancerActivity: text(),
	freelancerKycData: jsonb(),
	previousAccountId: text("previous_account_id"),
}, (table) => [
	index("users_emailVerificationToken_idx").using("btree", table.emailVerificationToken.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_emailVerificationToken_key").using("btree", table.emailVerificationToken.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")).where(sql`"deletedAt" IS NULL`),
	index("users_resetToken_idx").using("btree", table.resetToken.asc().nullsLast().op("text_ops")),
	uniqueIndex("users_resetToken_key").using("btree", table.resetToken.asc().nullsLast().op("text_ops")),
	index("users_previousAccountId_idx").using("btree", table.previousAccountId.asc().nullsLast().op("text_ops")),
]);

export const adminActivityLogs = pgTable("admin_activity_logs", {
	id: text().primaryKey().notNull(),
	adminId: text().notNull(),
	action: text().notNull(),
	resource: text(),
	resourceId: text(),
	details: jsonb(),
	ipAddress: text(),
	userAgent: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("admin_activity_logs_action_idx").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("admin_activity_logs_adminId_idx").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("admin_activity_logs_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.adminId],
		foreignColumns: [admins.id],
		name: "admin_activity_logs_adminId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const whitelistedDomains = pgTable("whitelisted_domains", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	domain: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	verificationToken: text().notNull(),
	verified: boolean().default(false).notNull(),
	verifiedAt: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("whitelisted_domains_businessId_domain_key").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.domain.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "whitelisted_domains_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxTransactions = pgTable("sandbox_transactions", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	reference: text(),
	customerName: encryptedText("customerName"),
	customerEmail: encryptedText("customerEmail"),
	fromCurrency: text(),
	fromNetwork: text(),
	fromAmount: numeric({ precision: 18, scale: 8 }),
	toCurrency: text(),
	toNetwork: text(),
	toAmount: numeric({ precision: 18, scale: 8 }),
	walletAddress: encryptedText("walletAddress"),
	amount: numeric({ precision: 18, scale: 8 }),
	cryptoAmount: numeric({ precision: 18, scale: 8 }),
	currency: text(),
	cryptoCurrency: text(),
	depositAddress: text(),
	walletReferenceId: text(),
	addressSource: text(),
	bankCode: text(),
	accountNumber: encryptedText("accountNumber"),
	accountName: encryptedText("accountName"),
	isMobileMoney: boolean().default(false),
	type: text().default('crypto'),
	status: transactionStatus().default('PENDING').notNull(),
	payoutStatus: payoutStatus().default('PENDING').notNull(),
	transactionHash: text(),
	txHash: text(),
	blockConfirmations: integer().default(0),
	actualAmount: numeric({ precision: 18, scale: 8 }),
	fees: numeric({ precision: 18, scale: 8 }),
	exchangeRate: numeric({ precision: 18, scale: 8 }),
	notes: encryptedText("notes"),
	externalId: text(),
	estimatedUsdtAmount: numeric({ precision: 18, scale: 8 }),
	callbackUrl: text(),
	redirectUrl: text(),
	description: encryptedText("description"),
	invoiceId: text(),
	paymentLinkId: text(),
	coachingPaymentLinkId: text("coaching_payment_link_id"),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	expectedAmount: numeric({ precision: 18, scale: 8 }),
	refundAddress: encryptedText("refundAddress"),
	refundTxHash: text(),
	refundAmount: numeric({ precision: 18, scale: 8 }),
	paymentTolerance: numeric({ precision: 5, scale: 4 }).default('0.01'),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	checkoutSessionId: text(),
	completedAt: timestamp({ precision: 3, mode: 'string' }),
	errorCode: text(),
	failureReason: text(),
	refundHash: text(),
	refundStatus: text().default('PENDING'),
	paymentStatus: text("payment_status").default('PENDING'),
	underpaidAmount: numeric("underpaid_amount", { precision: 36, scale: 18 }),
	overpaidAmount: numeric("overpaid_amount", { precision: 36, scale: 18 }),
	refundProcessedAt: timestamp("refund_processed_at", { precision: 3, mode: 'string' }),
	topUpAllowed: boolean("top_up_allowed").default(true),
	metadata: jsonb(),
	posDeviceId: text("pos_device_id"),
	// Original amount/currency from merchant request (before FX conversion)
	originalAmount: numeric("original_amount", { precision: 18, scale: 8 }),
	originalCurrency: text("original_currency"),
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }),
	fxApplied: boolean("fx_applied").default(false),
}, (table) => [
	index("idx_sandbox_transactions_payment_status").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("idx_sandbox_transactions_checkout_session_status").using("btree", table.checkoutSessionId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_sandbox_transactions_pos_device_id").using("btree", table.posDeviceId.asc().nullsLast().op("text_ops")),
	index("idx_sandbox_transactions_refund_processed").using("btree", table.refundProcessedAt.asc().nullsLast().op("timestamp_ops")).where(sql`${table.refundProcessedAt} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_transactions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.checkoutSessionId],
		foreignColumns: [sandboxCheckoutSessions.id],
		name: "sandbox_transactions_checkoutSessionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [sandboxInvoices.id],
		name: "sandbox_transactions_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.paymentLinkId],
		foreignColumns: [sandboxPaymentLinks.id],
		name: "sandbox_transactions_paymentLinkId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.coachingPaymentLinkId],
		foreignColumns: [sandboxCoachingPaymentLinks.id],
		name: "sandbox_transactions_coachingPaymentLinkId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxInvoices = pgTable("sandbox_invoices", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	customerName: encryptedText("customerName").notNull(),
	customerEmail: encryptedText("customerEmail").notNull(),
	amount: numeric({ precision: 18, scale: 2 }).notNull(),
	discount: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	currency: text().notNull(),
	// FX fields captured at creation time when customer currency differs from business local currency
	settlementCurrency: text("settlement_currency"), // snapshot of business currency at creation
	fxApplied: boolean("fx_applied").default(false), // whether FX was involved during creation
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }), // rate to convert from settlement_currency (base) -> currency (target)
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	// Persisted settlement amount snapshot (amount in settlement currency at creation)
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: encryptedText("description"),
	status: invoiceStatus().default('DRAFT').notNull(),
	dueDate: timestamp({ precision: 3, mode: 'string' }),
	paidAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	invoiceNumber: text(),
	notes: text(),
}, (table) => [
	uniqueIndex("sandbox_invoices_invoiceNumber_key").using("btree", table.invoiceNumber.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_invoices_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxInvoiceItems = pgTable("sandbox_invoice_items", {
	id: text().primaryKey().notNull(),
	invoiceId: text().notNull(),
	description: text().notNull(),
	quantity: integer().default(1).notNull(),
	unitPrice: numeric({ precision: 18, scale: 2 }).notNull(),
	total: numeric({ precision: 18, scale: 2 }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [sandboxInvoices.id],
		name: "sandbox_invoice_items_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxWebhooks = pgTable("sandbox_webhooks", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	url: text().notNull(),
	events: text().array(),
	secret: text().notNull(),
	status: webhookStatus().default('ACTIVE').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_webhooks_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const businessDocuments = pgTable("business_documents", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	type: documentType().notNull(),
	fileName: text().notNull(),
	fileUrl: text().notNull(),
	fileSize: integer().notNull(),
	mimeType: text().notNull(),
	status: documentStatus().default('PENDING').notNull(),
	uploadedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	verifiedAt: timestamp({ precision: 3, mode: 'string' }),
	rejectedAt: timestamp({ precision: 3, mode: 'string' }),
	rejectionReason: text(),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	isActive: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "business_documents_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const wallets = pgTable("wallets", {
	id: text().primaryKey().notNull(),
	referenceId: text().notNull(),
	address: text().notNull(),
	blockchain: text().notNull(),
	network: text().notNull(),
	encryptedPrivateKey: text().notNull(),
	businessId: text(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("wallets_address_key").using("btree", table.address.asc().nullsLast().op("text_ops")),
	index("wallets_blockchain_network_idx").using("btree", table.blockchain.asc().nullsLast().op("text_ops"), table.network.asc().nullsLast().op("text_ops")),
	index("wallets_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("wallets_isActive_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("wallets_referenceId_key").using("btree", table.referenceId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "wallets_businessId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const notifications = pgTable("notifications", {
	id: text().primaryKey().notNull(),
	userId: text(),
	businessId: text(),
	type: notificationType().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	priority: notificationPriority().default('NORMAL').notNull(),
	isRead: boolean().default(false).notNull(),
	readAt: timestamp({ precision: 3, mode: 'string' }),
	actionUrl: text(),
	actionText: text(),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("notifications_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("notifications_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "notifications_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "notifications_userId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const currencies = pgTable("currencies", {
	id: text().primaryKey().notNull(),
	ticker: text().notNull(),
	network: text().notNull(),
	name: text(),
	imageUrl: text(),
	tokenContract: text(),
	legacyTicker: text(),
	decimals: integer(), // Number of decimal places for this currency
	lastUpdated: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("currencies_network_idx").using("btree", table.network.asc().nullsLast().op("text_ops")),
	index("currencies_ticker_idx").using("btree", table.ticker.asc().nullsLast().op("text_ops")),
	uniqueIndex("currencies_ticker_network_key").using("btree", table.ticker.asc().nullsLast().op("text_ops"), table.network.asc().nullsLast().op("text_ops")),
]);

export const adminNotifications = pgTable("admin_notifications", {
	id: text().primaryKey().notNull(),
	adminId: text().notNull(),
	type: notificationType().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	priority: notificationPriority().default('NORMAL').notNull(),
	isRead: boolean().default(false).notNull(),
	readAt: timestamp({ precision: 3, mode: 'string' }),
	actionUrl: text(),
	actionText: text(),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("admin_notifications_adminId_idx").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("admin_notifications_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("admin_notifications_isRead_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("admin_notifications_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.adminId],
		foreignColumns: [admins.id],
		name: "admin_notifications_adminId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxPaymentLinks = pgTable("sandbox_payment_links", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	title: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }),
	// When true, customer can input any amount between minAmount and maxAmount
	allowCustomAmount: boolean("allow_custom_amount").default(false),
	minAmount: numeric("min_amount", { precision: 18, scale: 2 }),
	maxAmount: numeric("max_amount", { precision: 18, scale: 2 }),
	currency: text().notNull(),
	// FX fields captured at creation time when customer currency differs from business local currency
	settlementCurrency: text("settlement_currency"), // snapshot of business currency at creation
	fxApplied: boolean("fx_applied").default(false), // whether FX was involved during creation
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }), // rate to convert from settlement_currency (base) -> currency (target)
	fxRateSource: text("fx_rate_source").default('exchangerate-api'),
	fxRateFetchedAt: timestamp("fx_rate_fetched_at", { precision: 3, mode: 'string' }),
	fxRateLastUpdateAt: timestamp("fx_rate_last_update_at", { precision: 3, mode: 'string' }),
	fxRateNextUpdateAt: timestamp("fx_rate_next_update_at", { precision: 3, mode: 'string' }),
	// Persisted settlement amount snapshot (amount in settlement currency at creation)
	settlementAmount: numeric("settlement_amount", { precision: 18, scale: 2 }),
	description: text(),
	// Optional URLs for success and cancel redirects
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	slug: text().notNull(),
	status: paymentLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	metadata: jsonb("metadata"),
	notificationEmail: text("notification_email"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("sandbox_payment_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_payment_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSettlements = pgTable("sandbox_settlements", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	amount: numeric({ precision: 18, scale: 2 }).notNull(),
	currency: text().notNull(),
	bankAccount: text().notNull(),
	bankName: text().notNull(),
	bankCode: text(),
	accountName: text(),
	status: settlementStatus().default('PENDING').notNull(),
	transactionCount: integer().default(0).notNull(),
	fees: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	requestedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	processedAt: timestamp({ precision: 3, mode: 'string' }),
	completedAt: timestamp({ precision: 3, mode: 'string' }),
	failureReason: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_settlements_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const generatedWallets = pgTable("generated_wallets", {
	id: text().primaryKey().notNull(),
	address: text().notNull(),
	blockchain: text().notNull(),
	network: text().notNull(),
	encryptedPrivateKey: text().notNull(),
	businessId: text(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	referenceId: text().notNull(),
}, (table) => [
	uniqueIndex("generated_wallets_address_key").using("btree", table.address.asc().nullsLast().op("text_ops")),
	index("generated_wallets_blockchain_network_idx").using("btree", table.blockchain.asc().nullsLast().op("text_ops"), table.network.asc().nullsLast().op("text_ops")),
	index("generated_wallets_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("generated_wallets_isActive_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("generated_wallets_referenceId_key").using("btree", table.referenceId.asc().nullsLast().op("text_ops")),
]);

export const systemSettings = pgTable("system_settings", {
	id: text().primaryKey().notNull(),
	category: text().notNull(),
	key: text().notNull(),
	value: jsonb().notNull(),
	updatedBy: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("system_settings_category_key_key").using("btree", table.category.asc().nullsLast().op("text_ops"), table.key.asc().nullsLast().op("text_ops")),
]);

export const kycVerifications = pgTable("kyc_verifications", {
	id: text().primaryKey().notNull(),
	jobId: text().notNull(),
	userId: text().notNull(),
	businessId: text().notNull(),
	providerUserId: text(), // unified field for different provider user ids
	provider: text().notNull(), // 'SMILE_ID', 'DIDIT', etc.
	product: text().notNull(),
	status: text().default('PENDING').notNull(),
	token: text(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	result: encryptedJson("result"),
	verifiedAt: timestamp({ precision: 3, mode: 'string' }),
	resultCode: text(),
	confidenceValue: doublePrecision(),
	idInfo: encryptedJson("idInfo"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("kyc_verifications_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("kyc_verifications_jobId_idx").using("btree", table.jobId.asc().nullsLast().op("text_ops")),
	uniqueIndex("kyc_verifications_jobId_key").using("btree", table.jobId.asc().nullsLast().op("text_ops")),
	index("kyc_verifications_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("kyc_verifications_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "kyc_verifications_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "kyc_verifications_userId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const supportedCurrencies = pgTable("supported_currencies", {
	id: text().primaryKey().notNull(),
	code: text().notNull(),
	name: text().notNull(),
	country: text().notNull(),
	symbol: text().notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("supported_currencies_code_key").using("btree", table.code.asc().nullsLast().op("text_ops")),
]);

export const exchangeRates = pgTable("exchange_rates", {
	id: text().primaryKey().notNull(),
	baseCurrency: text().notNull(),
	targetCurrency: text().notNull(),
	rate: numeric({ precision: 18, scale: 8 }).notNull(),
	source: text().default('exchangerate-api').notNull(),
	fetchedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	validUntil: timestamp({ precision: 3, mode: 'string' }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("exchange_rates_baseCurrency_targetCurrency_fetchedAt_key")
		.on(table.baseCurrency, table.targetCurrency, table.fetchedAt),
	index("exchange_rates_baseCurrency_targetCurrency_idx")
		.on(table.baseCurrency, table.targetCurrency),
	index("exchange_rates_validUntil_idx").on(table.validUntil),
]);

export const checkoutSessions = pgTable("checkout_sessions", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	customerName: encryptedText("customer_name"),
	customerEmail: encryptedText("customer_email"),
	description: encryptedText("description"),
	status: checkoutStatus().default('PENDING').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	refundAddress: encryptedText("refund_address"),
	depositAddress: text("deposit_address"),
	activeTransactionId: text("active_transaction_id"),
	paymentTolerance: numeric("payment_tolerance", { precision: 10, scale: 8 }).default('0.01'),
	armedAt: timestamp("armed_at", { precision: 3, mode: 'string' }),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
	fromCurrency: text("from_currency"),
	fromNetwork: text("from_network"),
	hasActivePayment: boolean("has_active_payment").default(false).notNull(),
	metadata: jsonb(),
	posDeviceId: text("pos_device_id"),
	// Original amount/currency from merchant request (before FX conversion)
	originalAmount: numeric("original_amount", { precision: 18, scale: 8 }),
	originalCurrency: text("original_currency"),
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }),
	fxApplied: boolean("fx_applied").default(false),
}, (table) => [
	index("idx_checkout_sessions_pos_device_id").using("btree", table.posDeviceId.asc().nullsLast().op("text_ops")),
	index("checkout_sessions_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("checkout_sessions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_checkout_sessions_status_armed_at").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.armedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_checkout_sessions_deposit_address").using("btree", table.depositAddress.asc().nullsLast().op("text_ops")),
	index("idx_checkout_sessions_refund_address").using("btree", table.refundAddress.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_checkout_sessions_active_transaction_unique").using("btree", table.activeTransactionId.asc().nullsLast().op("text_ops")).where(sql`${table.activeTransactionId} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "checkout_sessions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),

]);

export const flutterwaveBanks = pgTable("flutterwave_banks", {
	id: text().primaryKey().notNull(),
	bankId: integer("bank_id").notNull(),
	code: text().notNull(),
	name: text().notNull(),
	country: text().notNull(),
	currency: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("flutterwave_banks_bank_id_country_key").using("btree", table.bankId.asc().nullsLast().op("int4_ops"), table.country.asc().nullsLast().op("text_ops")),
	index("flutterwave_banks_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("flutterwave_banks_country_currency_idx").using("btree", table.country.asc().nullsLast().op("text_ops"), table.currency.asc().nullsLast().op("text_ops")),
	index("flutterwave_banks_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
]);

// New: Flutterwave bank branches table for persistent storage
export const flutterwaveBankBranches = pgTable("flutterwave_bank_branches", {
	id: text().primaryKey().notNull(),
	flutterwaveBankId: text("flutterwave_bank_id").notNull(), // references flutterwave_banks.id
	branchId: text("branch_id").notNull(), // provider branch id (string)
	code: text("code"), // optional branch code from provider
	name: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("fw_bank_branches_branch_bank_unique").using("btree", table.branchId.asc().nullsLast().op("text_ops"), table.flutterwaveBankId.asc().nullsLast().op("text_ops")),
	index("fw_bank_branches_bank_idx").using("btree", table.flutterwaveBankId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.flutterwaveBankId],
		foreignColumns: [flutterwaveBanks.id],
		name: "flutterwave_bank_branches_flutterwave_bank_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const flutterwaveMobileNetworks = pgTable("flutterwave_mobile_networks", {
	id: text().primaryKey().notNull(),
	networkCode: text("network_code").notNull(),
	networkName: text("network_name").notNull(),
	country: text().notNull(),
	currency: text().notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("flutterwave_mobile_networks_country_idx").using("btree", table.country.asc().nullsLast().op("text_ops")),
	index("flutterwave_mobile_networks_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("flutterwave_mobile_networks_network_code_country_key").using("btree", table.networkCode.asc().nullsLast().op("text_ops"), table.country.asc().nullsLast().op("text_ops")),
	index("flutterwave_mobile_networks_network_code_idx").using("btree", table.networkCode.asc().nullsLast().op("text_ops")),
]);

export const settlementPayouts = pgTable("settlement_payouts", {
	id: text().primaryKey().notNull(),
	settlementId: text("settlement_id").notNull(),
	settlementAccountId: text("settlement_account_id").notNull(),
	amount: numeric({ precision: 18, scale: 2 }).notNull(),
	currency: text().notNull(),
	fees: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	netAmount: numeric("net_amount", { precision: 18, scale: 2 }).notNull(),
	status: settlementPayoutStatus().default('PENDING').notNull(),
	flutterwaveTransferId: integer("flutterwave_transfer_id"),
	flutterwaveReference: text("flutterwave_reference"),
	providerResponse: jsonb("provider_response"),
	adminApprovedBy: text("admin_approved_by"),
	adminApprovedAt: timestamp("admin_approved_at", { precision: 3, mode: 'string' }),
	adminNotes: text("admin_notes"),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
	failedAt: timestamp("failed_at", { precision: 3, mode: 'string' }),
	failureReason: text("failure_reason"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	amountAfterVat: numeric("amount_after_vat", { precision: 18, scale: 2 }),
	vatAmount: numeric("vat_amount", { precision: 18, scale: 2 }),
	vatRate: numeric("vat_rate", { precision: 5, scale: 2 }),
}, (table) => [
	index("settlement_payouts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("settlement_payouts_flutterwave_transfer_id_idx").using("btree", table.flutterwaveTransferId.asc().nullsLast().op("int4_ops")),
	index("settlement_payouts_settlement_id_idx").using("btree", table.settlementId.asc().nullsLast().op("text_ops")),
	index("settlement_payouts_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.settlementAccountId],
		foreignColumns: [settlementAccounts.id],
		name: "settlement_payouts_settlement_account_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.settlementId],
		foreignColumns: [settlements.id],
		name: "settlement_payouts_settlement_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const gasFunding = pgTable("gas_funding", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	walletAddress: text().notNull(),
	network: text().notNull(),
	amount: text().notNull(),
	transactionType: text().default('transfer').notNull(),
	status: gasFundingStatus().default('PENDING').notNull(),
	txHash: text(),
	errorMessage: text(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	completedAt: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	index("gas_funding_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("gas_funding_createdAt_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("gas_funding_network_idx").using("btree", table.network.asc().nullsLast().op("text_ops")),
	index("gas_funding_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("gas_funding_walletAddress_idx").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "gas_funding_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const dkimKeys = pgTable("dkim_keys", {
	id: text().primaryKey().notNull(),
	domain: text().notNull(),
	selector: text().notNull(),
	privateKey: text().notNull(),
	publicKey: text().notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastUsedAt: timestamp({ precision: 3, mode: 'string' }),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("dkim_keys_domain_isActive_idx").using("btree", table.domain.asc().nullsLast().op("text_ops"), table.isActive.asc().nullsLast().op("bool_ops")),
	uniqueIndex("dkim_keys_domain_selector_key").using("btree", table.domain.asc().nullsLast().op("text_ops"), table.selector.asc().nullsLast().op("text_ops")),
]);

export const transferFee = pgTable("TransferFee", {
	id: serial().primaryKey().notNull(),
	currency: text().notNull(),
	paymentMethod: text().notNull(),
	minAmount: doublePrecision().notNull(),
	maxAmount: doublePrecision().notNull(),
	fee: doublePrecision().notNull(),
	feeType: text().default('fixed').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("TransferFee_currency_paymentMethod_idx")
		.on(table.currency, table.paymentMethod),

	uniqueIndex("TransferFee_currency_paymentMethod_minAmount_maxAmount_key")
		.on(table.currency, table.paymentMethod, table.minAmount, table.maxAmount),

]);

export const settlementAccounts = pgTable("settlement_accounts", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	type: settlementAccountType().notNull(),
	accountName: encryptedText("account_name").notNull(),
	accountNumber: encryptedText("account_number"),
	bankCode: encryptedText("bank_code"),
	bankName: text("bank_name"),
	// v4 optional recipient/address fields
	bankBranch: text("bank_branch"),
	recipientEmail: text("recipient_email"),
	addressLine1: text("address_line1"),
	addressLine2: text("address_line2"),
	city: text(),
	state: text(),
	postalCode: text("postal_code"),
	phoneNumber: encryptedText("phone_number"),
	mobileNetworkCode: text("mobile_network_code"),
	mobileNetworkName: text("mobile_network_name"),
	currency: text().notNull(),
	country: text().notNull(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	verificationData: jsonb("verification_data"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	verifiedAt: timestamp("verified_at", { precision: 3, mode: 'string' }),
	network: cryptoNetwork("network"),
	walletAddress: encryptedText("wallet_address"),
}, (table) => [
	index("settlement_accounts_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	uniqueIndex("settlement_accounts_business_primary_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.isPrimary.asc().nullsLast().op("bool_ops")).where(sql`is_primary = true AND is_active = true`),
	uniqueIndex("settlement_accounts_bank_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.accountNumber.asc().nullsLast().op("text_ops"), table.bankCode.asc().nullsLast().op("text_ops"), table.currency.asc().nullsLast().op("text_ops")).where(sql`type = 'BANK_TRANSFER' AND is_active = true`),
	uniqueIndex("settlement_accounts_mobile_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.phoneNumber.asc().nullsLast().op("text_ops"), table.mobileNetworkCode.asc().nullsLast().op("text_ops"), table.currency.asc().nullsLast().op("text_ops")).where(sql`type = 'MOBILE_MONEY' AND is_active = true`),
	index("settlement_accounts_currency_idx").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	index("settlement_accounts_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("settlement_accounts_is_primary_idx").using("btree", table.isPrimary.asc().nullsLast().op("bool_ops")),
	index("settlement_accounts_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "settlement_accounts_business_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const paymentFiatRates = pgTable("payment_fiat_rates", {
	id: text().primaryKey().notNull(),
	currency: text().notNull(),
	rate: numeric({ precision: 18, scale: 8 }).notNull(),
	source: text().default('cryptocompare').notNull(),
	marketRate: numeric("market_rate", { precision: 18, scale: 8 }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("payment_fiat_rates_currency_idx").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	uniqueIndex("payment_fiat_rates_currency_key").using("btree", table.currency.asc().nullsLast().op("text_ops")),
	index("payment_fiat_rates_source_idx").using("btree", table.source.asc().nullsLast().op("text_ops")),
	index("payment_fiat_rates_updatedAt_idx").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
]);

export const businesses = pgTable("businesses", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: encryptedText("email"),
	phone: encryptedText("phone"),
	address: encryptedText("address"),
	website: text(),
	ownerId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	businessRegistrationDoc: text(),
	country: text(),
	description: text(),
	industry: text(),
	isSandboxMode: boolean().default(true).notNull(),
	onboardingStatus: onboardingStatus().default('PENDING').notNull(),
	supportingDocs: text().array(),
	taxIdNumber: encryptedText("taxIdNumber"),
	verificationStatus: verificationStatus().default('PENDING').notNull(),
	businessType: text(),
	currency: text(),
	logo: text(),
	numberOfDirectors: integer(),
	numberOfShareholders: integer(),
	kycVerifiedAt: timestamp("kyc_verified_at", { precision: 3, mode: 'string' }),
	kycVerified: boolean("kyc_verified").default(false).notNull(),
	kycProvider: text("kyc_provider"), // 'SMILE_ID', 'DIDIT', etc.
	uboDeclaration: encryptedJson("uboDeclaration"),
	directorDeclaration: encryptedJson("director_declaration"),
	businessAddressProofDoc: text("business_address_proof_doc"),
	authorizationLetterDoc: text("authorization_letter_doc"),
	onboardingProgress: jsonb("onboarding_progress"),
	minTransactionAmountUSD: numeric({ precision: 18, scale: 2 }),
	maxTransactionAmountUSD: numeric({ precision: 18, scale: 2 }),
	// Notification preferences
	notificationPreference: text().default('email_only').notNull(), // 'email_only' or 'email_and_sms'
	phoneVerified: boolean().default(false).notNull(),
	phoneVerifiedAt: timestamp({ precision: 3, mode: 'string' }),
	deletedAt: timestamp({ precision: 3, mode: 'string' }),
	customFiatSettlementMarkup: numeric("custom_fiat_settlement_markup", { precision: 5, scale: 2 }),
	customCryptoSettlementMarkup: numeric("custom_crypto_settlement_markup", { precision: 5, scale: 2 }),
	preferredSettlementType: preferredSettlementTypeEnum("preferred_settlement_type").default('FIAT').notNull(),
	preferredCryptoAsset: cryptoAsset("preferred_crypto_asset"),
	preferredCryptoNetwork: cryptoNetwork("preferred_crypto_network"),
	cryptoWalletAddress: text("crypto_wallet_address"),
	posEnabled: boolean("pos_enabled").default(false).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.ownerId],
		foreignColumns: [users.id],
		name: "businesses_ownerId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const customRoles = pgTable("custom_roles", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	permissions: text().array(),
	isActive: boolean().default(true).notNull(),
	createdBy: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("custom_roles_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
]);

export const admins = pgTable("admins", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	firstName: encryptedText("firstName").notNull(),
	lastName: encryptedText("lastName").notNull(),
	password: text(),
	role: adminRole().default('ADMIN').notNull(),
	permissions: text().array(),
	isActive: boolean().default(true).notNull(),
	lastLoginAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	profileImageUrl: text(),
	customRoleId: text(),
	onboardingToken: text(),
	onboardingTokenExpiry: timestamp({ precision: 3, mode: 'string' }),
	twoFactorBackupCodes: text().array().default(["RAY"]),
	twoFactorEnabled: boolean().default(false).notNull(),
	twoFactorSecret: text(),
}, (table) => [
	uniqueIndex("admins_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("admins_onboardingToken_idx").using("btree", table.onboardingToken.asc().nullsLast().op("text_ops")),
	uniqueIndex("admins_onboardingToken_key").using("btree", table.onboardingToken.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.customRoleId],
		foreignColumns: [customRoles.id],
		name: "admins_customRoleId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxCheckoutSessions = pgTable("sandbox_checkout_sessions", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	customerName: encryptedText("customer_name"),
	customerEmail: encryptedText("customer_email"),
	description: encryptedText("description"),
	status: checkoutStatus().default('PENDING').notNull(),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	refundAddress: encryptedText("refund_address"),
	depositAddress: text("deposit_address"),
	activeTransactionId: text("active_transaction_id"),
	paymentTolerance: numeric("payment_tolerance", { precision: 10, scale: 8 }).default('0.01'),
	armedAt: timestamp("armed_at", { precision: 3, mode: 'string' }),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
	fromCurrency: text("from_currency"),
	fromNetwork: text("from_network"),
	hasActivePayment: boolean("has_active_payment").default(false).notNull(),
	metadata: jsonb(),
	posDeviceId: text("pos_device_id"),
	// Original amount/currency from merchant request (before FX conversion)
	originalAmount: numeric("original_amount", { precision: 18, scale: 8 }),
	originalCurrency: text("original_currency"),
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }),
	fxApplied: boolean("fx_applied").default(false),
}, (table) => [
	index("idx_sandbox_checkout_sessions_pos_device_id").using("btree", table.posDeviceId.asc().nullsLast().op("text_ops")),
	index("sandbox_checkout_sessions_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_checkout_sessions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_sandbox_checkout_sessions_status_armed_at").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.armedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_sandbox_checkout_sessions_deposit_address").using("btree", table.depositAddress.asc().nullsLast().op("text_ops")),
	index("idx_sandbox_checkout_sessions_refund_address").using("btree", table.refundAddress.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_sandbox_checkout_sessions_active_transaction_unique").using("btree", table.activeTransactionId.asc().nullsLast().op("text_ops")).where(sql`${table.activeTransactionId} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_checkout_sessions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const webhookLogs = pgTable("webhook_logs", {
	id: text().primaryKey().notNull(),
	webhookId: text(),
	businessId: text().notNull(),
	transactionId: text(),
	eventType: text().notNull(),
	event: text(),
	url: text().notNull(),
	payload: jsonb().notNull(),
	response: jsonb(),
	success: boolean().notNull(),
	statusCode: integer(),
	error: text(),
	timestamp: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("webhook_logs_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("webhook_logs_eventType_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("webhook_logs_timestamp_idx").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("webhook_logs_transactionId_idx").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	index("webhook_logs_webhookId_idx").using("btree", table.webhookId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "webhook_logs_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const transactions = pgTable("transactions", {
	id: text().primaryKey().notNull(),
	businessId: text().notNull(),
	customerName: encryptedText("customerName"),
	customerEmail: encryptedText("customerEmail"),
	walletAddress: encryptedText("walletAddress"),
	amount: numeric({ precision: 18, scale: 8 }),
	cryptoAmount: numeric({ precision: 18, scale: 8 }),
	currency: text(),
	cryptoCurrency: text(),
	status: transactionStatus().default('PENDING').notNull(),
	payoutStatus: payoutStatus().default('PENDING').notNull(),
	transactionHash: text(),
	blockConfirmations: integer().default(0),
	fees: numeric({ precision: 18, scale: 8 }),
	exchangeRate: numeric({ precision: 18, scale: 8 }),
	marketExchangeRate: numeric("market_exchange_rate", { precision: 18, scale: 8 }),
	invoiceId: text(),
	paymentLinkId: text(),
	coachingPaymentLinkId: text("coaching_payment_link_id"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
	accountName: encryptedText("accountName"),
	accountNumber: encryptedText("accountNumber"),
	actualAmount: numeric({ precision: 18, scale: 8 }),
	addressSource: text(),
	bankCode: text(),
	callbackUrl: text(),
	depositAddress: text(),
	description: encryptedText("description"),
	estimatedUsdtAmount: numeric({ precision: 18, scale: 8 }),
	expectedAmount: numeric({ precision: 18, scale: 8 }),
	expiresAt: timestamp({ precision: 3, mode: 'string' }),
	externalId: text(),
	fromAmount: numeric({ precision: 18, scale: 8 }),
	fromCurrency: text(),
	fromNetwork: text(),
	isMobileMoney: boolean().default(false),
	notes: encryptedText("notes"),
	paymentTolerance: numeric({ precision: 5, scale: 4 }).default('0.01'),
	redirectUrl: text(),
	reference: text(),
	refundAddress: encryptedText("refundAddress"),
	refundAmount: numeric({ precision: 18, scale: 8 }),
	refundTxHash: text(),
	toAmount: numeric({ precision: 18, scale: 8 }),
	toCurrency: text(),
	toNetwork: text(),
	txHash: text(),
	type: text().default('crypto'),
	walletReferenceId: text(),
	checkoutSessionId: text(),
	gateioOrderId: text(),
	usdValue: numeric({ precision: 18, scale: 2 }),
	usdtAmount: numeric({ precision: 18, scale: 8 }),
	riskFlags: jsonb(),
	riskLevel: text().default('LOW'),
	riskScore: integer().default(0),
	depositTxHash: text(),
	settlementId: text(),
	paymentStatus: text("payment_status").default('PENDING'),
	underpaidAmount: numeric("underpaid_amount", { precision: 36, scale: 18 }),
	overpaidAmount: numeric("overpaid_amount", { precision: 36, scale: 18 }),
	refundProcessedAt: timestamp("refund_processed_at", { precision: 3, mode: 'string' }),
	topUpAllowed: boolean("top_up_allowed").default(true),
	senderAddress: text("senderAddress"),
	metadata: jsonb(),
	posDeviceId: text("pos_device_id"),
	// Original amount/currency from merchant request (before FX conversion)
	originalAmount: numeric("original_amount", { precision: 18, scale: 8 }),
	originalCurrency: text("original_currency"),
	fxRate: numeric("fx_rate", { precision: 18, scale: 8 }),
	fxApplied: boolean("fx_applied").default(false),
}, (table) => [
	index("idx_transactions_payment_status").using("btree", table.paymentStatus.asc().nullsLast().op("text_ops")),
	index("idx_transactions_checkout_session_status").using("btree", table.checkoutSessionId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("enum_ops")),
	index("idx_transactions_pos_device_id").using("btree", table.posDeviceId.asc().nullsLast().op("text_ops")),
	index("idx_transactions_refund_processed").using("btree", table.refundProcessedAt.asc().nullsLast().op("timestamp_ops")).where(sql`${table.refundProcessedAt} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "transactions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.checkoutSessionId],
		foreignColumns: [checkoutSessions.id],
		name: "transactions_checkoutSessionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [invoices.id],
		name: "transactions_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.paymentLinkId],
		foreignColumns: [paymentLinks.id],
		name: "transactions_paymentLinkId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.coachingPaymentLinkId],
		foreignColumns: [coachingPaymentLinks.id],
		name: "transactions_coachingPaymentLinkId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.settlementId],
		foreignColumns: [settlements.id],
		name: "transactions_settlementId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const currencyAggregates = pgTable("currency_aggregates", {
	id: text().primaryKey().notNull(),
	currency: text().notNull(),
	totalAmount: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
	totalTransactions: integer().default(0).notNull(),
	lastUpdated: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	totalUsdValue: numeric({ precision: 18, scale: 2 }).default('0').notNull(),
}, (table) => [
	uniqueIndex("currency_aggregates_currency_key").using("btree", table.currency.asc().nullsLast().op("text_ops")),
]);

export const processedTransactions = pgTable("processed_transactions", {
	id: text().primaryKey().notNull(),
	transactionId: text().notNull(),
	processedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	processType: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("processed_transactions_processType_idx").using("btree", table.processType.asc().nullsLast().op("text_ops")),
	index("processed_transactions_transactionId_idx").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	uniqueIndex("processed_transactions_transactionId_key").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
]);

export const idempotencyKeys = pgTable("idempotency_keys", {
	id: text().default(sql`gen_random_uuid()`).primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	idempotencyKey: text("idempotency_key").notNull(),
	endpoint: text().notNull(),
	requestHash: text("request_hash").notNull(),
	responseData: jsonb("response_data"),
	statusCode: integer("status_code"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`NOW()`).notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("idx_idempotency_keys_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.idempotencyKey.asc().nullsLast().op("text_ops"), table.endpoint.asc().nullsLast().op("text_ops")),
	index("idx_idempotency_keys_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "fk_idempotency_keys_business"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const webhookIdempotency = pgTable("webhook_idempotency", {
	id: text().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	webhookId: text("webhook_id").notNull(),
	businessId: text("business_id").notNull(),
	eventId: text("event_id").notNull(),
	eventType: text("event_type").notNull(),
	payloadHash: text("payload_hash").notNull(),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }).default(sql`NOW()`).notNull(),
	result: jsonb(),
}, (table) => [
	uniqueIndex("idx_webhook_idempotency_unique").using("btree", table.webhookId.asc().nullsLast().op("text_ops"), table.eventId.asc().nullsLast().op("text_ops"), table.eventType.asc().nullsLast().op("text_ops")),
	index("idx_webhook_idempotency_business_event").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.eventType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.webhookId],
		foreignColumns: [webhooks.id],
		name: "fk_webhook_idempotency_webhook"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "fk_webhook_idempotency_business"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const fundSweepLogs = pgTable("fund_sweep_logs", {
	id: serial().primaryKey().notNull(),
	timestamp: timestamp({ precision: 3, mode: 'string' }).notNull(),
	totalSwept: numeric("total_swept", { precision: 20, scale: 8 }).default('0').notNull(),
	totalUsdtConverted: numeric("total_usdt_converted", { precision: 20, scale: 8 }).default('0').notNull(),
	walletsSwept: integer("wallets_swept").default(0).notNull(),
	conversionsCount: integer("conversions_count").default(0).notNull(),
	errorsCount: integer("errors_count").default(0).notNull(),
	details: text(), // JSON string containing detailed results
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("idx_fund_sweep_logs_timestamp").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("idx_fund_sweep_logs_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
]);

export const pendingSweeps = pgTable("pending_sweeps", {
	id: text().primaryKey().notNull(),
	transactionId: text("transaction_id").notNull(),
	walletAddress: text("wallet_address").notNull(),
	network: text().notNull(),
	currency: text().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	usdValue: numeric("usd_value", { precision: 18, scale: 2 }),
	status: sweepStatus().default('PENDING').notNull(),
	destination: text(), // 'gateio' or 'central_wallet'
	transferHash: text("transfer_hash"),
	retryCount: integer("retry_count").default(0).notNull(),
	lastError: text("last_error"),
	nextRetryAt: timestamp("next_retry_at", { precision: 3, mode: 'string' }),
	discoveredTokenContract: text("discovered_token_contract"), // Contract address from currencies table
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
}, (table) => [
	index("idx_pending_sweeps_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_pending_sweeps_network_currency").using("btree", table.network.asc().nullsLast().op("text_ops"), table.currency.asc().nullsLast().op("text_ops")),
	index("idx_pending_sweeps_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_pending_sweeps_next_retry").using("btree", table.nextRetryAt.asc().nullsLast().op("timestamp_ops")),
	uniqueIndex("pending_sweeps_transaction_id_key").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
]);

export const exchangeDeposits = pgTable("exchange_deposits", {
	id: text().primaryKey().notNull(),
	token: text().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	txHash: text("tx_hash"),
	network: text().notNull(),
	status: exchangeDepositStatus().default('PENDING').notNull(),
	usdAmount: numeric("usd_amount", { precision: 18, scale: 2 }),
	lastError: text("last_error"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("idx_exchange_deposits_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("idx_exchange_deposits_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
]);

export const customers = pgTable("customers", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	email: text().notNull(),
	firstName: encryptedText("first_name"),
	lastName: encryptedText("last_name"),
	walletAddress: encryptedText("wallet_address"),
	metadata: encryptedJson("metadata"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("customers_business_email_key").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("customers_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("customers_wallet_address_idx").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	uniqueIndex("customers_business_wallet_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.walletAddress.asc().nullsLast().op("text_ops")).where(sql`${table.walletAddress} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "customers_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	name: text().notNull(),
	description: text(),
	chain: text().notNull(), // blockchain network (e.g., 'ethereum', 'polygon')
	token: text().notNull(), // token contract address or symbol
	active: boolean().default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_plans_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_plans_chain_token_idx").using("btree", table.chain.asc().nullsLast().op("text_ops"), table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_plans_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscriptionPrices = pgTable("subscription_prices", {
	id: text().primaryKey().notNull(),
	planId: text("plan_id").notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(), // token symbol or contract address
	billingInterval: billingInterval("billing_interval").notNull(),
	intervalCount: integer("interval_count").default(1).notNull(), // e.g., every 2 months
	trialPeriodDays: integer("trial_period_days").default(0),
	active: boolean().default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_prices_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	index("subscription_prices_billing_interval_idx").using("btree", table.billingInterval.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.planId],
		foreignColumns: [subscriptionPlans.id],
		name: "subscription_prices_planId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscriptions = pgTable("subscriptions", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	customerId: text("customer_id").notNull(),
	priceId: text("price_id"), // nullable for metered subscriptions
	authId: text("auth_id"), // on-chain authorization id (bytes32 hex)
	tokenId: text("token_id"), // FK to currencies.id: user's selected payment token
	status: subscriptionStatus().default('ACTIVE').notNull(),
	billingMode: billingMode().default('FIXED').notNull(), // FIXED or METERED
	capAmount: numeric("cap_amount", { precision: 78, scale: 0 }), // max allowance for metered billing (token units)
	maxPerCharge: numeric("max_per_charge", { precision: 78, scale: 0 }), // max amount per single charge (token units)
	authorizationExpiry: timestamp("authorization_expiry", { precision: 3, mode: 'string', withTimezone: true }), // when auth expires
	totalCyclesAllowed: integer("total_cycles_allowed"), // total number of billing cycles allowed for metered subscriptions
	cyclesUsed: integer("cycles_used").default(0), // number of billing cycles used so far
	cycleTrackingEnabled: boolean("cycle_tracking_enabled").default(false).notNull(), // whether to track billing cycles for this subscription
	currentPeriodStart: timestamp("current_period_start", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	currentPeriodEnd: timestamp("current_period_end", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	trialStart: timestamp("trial_start", { precision: 3, mode: 'string', withTimezone: true }),
	trialEnd: timestamp("trial_end", { precision: 3, mode: 'string', withTimezone: true }),
	cancelledAt: timestamp("cancelled_at", { precision: 3, mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	walletAddress: text("wallet_address"), // customer's payment wallet
	metadata: jsonb(),
	currentRenewalCounter: integer("current_renewal_counter").default(0).notNull(),
	currentPriceId: text("current_price_id"),
	pendingPriceChangeId: text("pending_price_change_id"),
	renewalWindowStart: timestamp("renewal_window_start", { precision: 3, mode: 'string', withTimezone: true }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("subscriptions_auth_id_key").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	uniqueIndex("subscriptions_customer_price_active_key").using("btree", table.customerId.asc().nullsLast().op("int4_ops"), table.priceId.asc().nullsLast().op("int4_ops")).where(sql`${table.status} = 'ACTIVE'`),
	index("subscriptions_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscriptions_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("int4_ops")),
	index("subscriptions_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("int4_ops")),
	index("subscriptions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("subscriptions_current_period_end_idx").using("btree", table.currentPeriodEnd.asc().nullsLast().op("timestamp_ops")),
	index("subscriptions_cancel_at_period_end_idx").using("btree", table.cancelAtPeriodEnd.asc().nullsLast().op("bool_ops")).where(sql`${table.cancelAtPeriodEnd} = true`),
	index("subscriptions_token_id_idx").using("btree", table.tokenId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscriptions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "subscriptions_customerId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [subscriptionPrices.id],
		name: "subscriptions_priceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.tokenId],
		foreignColumns: [currencies.id],
		name: "subscriptions_tokenId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const subscriptionInvoices = pgTable("subscription_invoices", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	subscriptionId: text("subscription_id").notNull(),
	priceId: text("price_id"), // nullable for metered invoices
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	status: subscriptionInvoiceStatus().default('DRAFT').notNull(),
	billingMode: billingMode().default('FIXED').notNull(), // FIXED or METERED
	usageQuantity: numeric("usage_quantity", { precision: 18, scale: 8 }), // usage amount for metered billing
	usageDescription: text("usage_description"), // description of usage for metered billing
	periodStart: timestamp("period_start", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	periodEnd: timestamp("period_end", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	dueDate: timestamp("due_date", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	paidAt: timestamp("paid_at", { precision: 3, mode: 'string', withTimezone: true }),
	voidedAt: timestamp("voided_at", { precision: 3, mode: 'string', withTimezone: true }),
	attemptCount: integer("attempt_count").default(0).notNull(),
	nextPaymentAttempt: timestamp("next_payment_attempt", { precision: 3, mode: 'string', withTimezone: true }),
	processing: boolean().default(false).notNull(),
	onchainInvoiceId: text("onchain_invoice_id"), // bytes32 hex used for idempotent charge()
	fromAmountUnits: numeric("from_amount_units", { precision: 78, scale: 0 }), // token amount to charge (smallest units)
	fromAmountHuman: text("from_amount_human"), // human-readable token amount (e.g., '750.12')
	exchangeRate: numeric("exchange_rate", { precision: 30, scale: 10 }), // fx rate at quote/charge time
	exchangeSource: text("exchange_source"), // pricing source identifier
	fees: jsonb(), // snapshot of applied fees
	quoteExpiresAt: timestamp("quote_expires_at", { precision: 3, mode: 'string', withTimezone: true }), // quote TTL cutoff used for this invoice
	metadata: jsonb(),
	// New: settlement link (nullable)
	settlementId: text("settlement_id"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_invoices_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_invoices_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("subscription_invoices_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("subscription_invoices_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("subscription_invoices_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("subscription_invoices_next_attempt_idx").using("btree", table.nextPaymentAttempt.asc().nullsLast().op("timestamp_ops")),
	index("subscription_invoices_status_next_attempt_processing_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.nextPaymentAttempt.asc().nullsLast().op("timestamp_ops"), table.processing.asc().nullsLast().op("bool_ops")),
	index("subscription_invoices_onchain_id_idx").using("btree", table.onchainInvoiceId.asc().nullsLast().op("text_ops")),
	// New indexes: settlement_id and paid_at
	index("subscription_invoices_settlement_id_idx").using("btree", table.settlementId.asc().nullsLast().op("text_ops")),
	index("subscription_invoices_paid_at_idx").using("btree", table.paidAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_invoices_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [subscriptions.id],
		name: "subscription_invoices_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [subscriptionPrices.id],
		name: "subscription_invoices_priceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	// New FK: subscription_invoices.settlement_id -> settlements.id (ON DELETE SET NULL)
	foreignKey({
		columns: [table.settlementId],
		foreignColumns: [settlements.id],
		name: "subscription_invoices_settlementId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const subscriptionAuthorizations = pgTable("subscription_authorizations", {
	id: text().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	subscriptionId: text("subscription_id").notNull(),
	authId: text("auth_id").notNull(),
	priceId: text("price_id"), // nullable for metered subscriptions
	renewalCounter: integer("renewal_counter").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string', withTimezone: true }),
	revokedAt: timestamp("revoked_at", { precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("subscription_authorizations_auth_id_key").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	index("subscription_authorizations_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("subscription_authorizations_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("subscription_authorizations_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("subscription_authorizations_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [subscriptions.id],
		name: "subscription_authorizations_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSubscriptionAuthorizations = pgTable("sandbox_subscription_authorizations", {
	id: text().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	subscriptionId: text("subscription_id").notNull(),
	authId: text("auth_id").notNull(),
	priceId: text("price_id"), // nullable for metered subscriptions
	renewalCounter: integer("renewal_counter").notNull(),
	isActive: boolean("is_active").default(false).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string', withTimezone: true }),
	revokedAt: timestamp("revoked_at", { precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("sandbox_subscription_authorizations_auth_id_key").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_authorizations_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_authorizations_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_authorizations_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("sandbox_subscription_authorizations_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast()),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [sandboxSubscriptions.id],
		name: "sandbox_subscription_authorizations_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscriptionChargeAttempts = pgTable("subscription_charge_attempts", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	invoiceId: text("invoice_id").notNull(),
	transactionId: text("transaction_id"), // reference to existing transactions table
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	status: chargeStatus().default('PENDING').notNull(),
	walletAddress: text("wallet_address").notNull(),
	transactionHash: text("transaction_hash"),
	blockConfirmations: integer("block_confirmations").default(0),
	chain: text().notNull(),
	failureReason: text("failure_reason"),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_charge_attempts_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_charge_attempts_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("int4_ops")),
	index("subscription_charge_attempts_transaction_id_idx").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	index("subscription_charge_attempts_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("subscription_charge_attempts_transaction_hash_idx").using("btree", table.transactionHash.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_charge_attempts_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [subscriptionInvoices.id],
		name: "subscription_charge_attempts_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.transactionId],
		foreignColumns: [transactions.id],
		name: "subscription_charge_attempts_transactionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const paymentMethods = pgTable("payment_methods", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	customerId: text("customer_id").notNull(),
	type: paymentMethodType().notNull(),
	walletAddress: encryptedText("wallet_address"),
	chain: text(), // blockchain network for crypto wallets
	bankAccount: encryptedText("bank_account"), // for bank transfers
	mobileNumber: encryptedText("mobile_number"), // for mobile money
	approvedSpender: text("approved_spender"),
	tokenContract: text("token_contract"),
	tokenDecimals: integer("token_decimals"),
	allowanceAmount: numeric("allowance_amount", { precision: 78, scale: 0 }),
	authId: text("auth_id"),
	isDefault: boolean("is_default").default(false).notNull(),
	active: boolean().default(true).notNull(),
	metadata: encryptedJson("metadata"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("payment_methods_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("payment_methods_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("text_ops")),
	index("payment_methods_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("payment_methods_wallet_address_idx").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	index("payment_methods_auth_id_idx").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	index("payment_methods_token_contract_idx").using("btree", table.tokenContract.asc().nullsLast().op("text_ops")),
	uniqueIndex("payment_methods_customer_default_unique").using("btree", table.customerId.asc().nullsLast().op("text_ops")).where(sql`${table.isDefault} = true`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "payment_methods_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "payment_methods_customerId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const subscriptionCheckoutSessions = pgTable("subscription_checkout_sessions", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	priceId: text("price_id"), // nullable for metered mode
	customerId: text("customer_id"),
	customerEmail: text("customer_email"),
	status: checkoutStatus().default('PENDING').notNull(),
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	subscriptionId: text("subscription_id"), // set after successful checkout
	walletAddress: text("wallet_address"),
	chain: text(),
	tokenId: text("token_id"), // FK to currencies.id selected at confirm
	billingMode: billingMode().default('FIXED').notNull(), // FIXED or METERED
	expectedUsageCurrency: text("expected_usage_currency"), // for metered mode expected usage
	expectedUsageAmount: numeric("expected_usage_amount", { precision: 18, scale: 8 }), // for metered mode expected usage
	strategy: text(), // conservative, moderate, liberal, custom
	customMultiplier: numeric("custom_multiplier", { precision: 5, scale: 2 }), // custom multiplier when strategy is custom
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_checkout_sessions_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_checkout_sessions_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("subscription_checkout_sessions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("subscription_checkout_sessions_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("subscription_checkout_sessions_status_expires_at_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("subscription_checkout_sessions_token_id_idx").using("btree", table.tokenId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_checkout_sessions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [subscriptionPrices.id],
		name: "subscription_checkout_sessions_priceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "subscription_checkout_sessions_customerId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [subscriptions.id],
		name: "subscription_checkout_sessions_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const subscriptionEvents = pgTable("subscription_events", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	subscriptionId: text("subscription_id"),
	invoiceId: text("invoice_id"),
	customerId: text("customer_id"),
	eventType: text("event_type").notNull(), // e.g., 'subscription.created', 'invoice.paid'
	data: jsonb().notNull(), // event payload
	processed: boolean().default(false).notNull(),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
	webhookDelivered: boolean("webhook_delivered").default(false).notNull(),
	webhookDeliveredAt: timestamp("webhook_delivered_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("subscription_events_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_events_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("subscription_events_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("subscription_events_processed_idx").using("btree", table.processed.asc().nullsLast().op("bool_ops")),
	index("subscription_events_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_events_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [subscriptions.id],
		name: "subscription_events_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [subscriptionInvoices.id],
		name: "subscription_events_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [customers.id],
		name: "subscription_events_customerId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const subscriptionLinks = pgTable("subscription_links", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	planId: text("plan_id").notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	description: text(),
	status: subscriptionLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("subscription_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("subscription_links_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("subscription_links_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("text_ops")),
	index("subscription_links_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "subscription_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.planId],
		foreignColumns: [subscriptionPlans.id],
		name: "subscription_links_planId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);
// SANDBOX TABLES
// Dedicated sandbox currencies table for subscription sandbox
export const sandboxSubscriptionCurrencies = pgTable("sandbox_subscription_currencies", {
	id: text().primaryKey().notNull(),
	ticker: text().notNull(),
	network: text().notNull(),
	name: text(),
	imageUrl: text("image_url"),
	tokenContract: text("token_contract"),
	legacyTicker: text("legacy_ticker"),
	decimals: integer("decimals"),
	lastUpdated: timestamp("last_updated", { precision: 3, mode: 'string' }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_currencies_network_idx").using("btree", table.network.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_currencies_ticker_idx").using("btree", table.ticker.asc().nullsLast().op("text_ops")),
	uniqueIndex("sandbox_subscription_currencies_ticker_network_unique").using("btree", table.ticker.asc().nullsLast().op("text_ops"), table.network.asc().nullsLast().op("text_ops")),
]);

export const sandboxCustomers = pgTable("sandbox_customers", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	email: encryptedText("email").notNull(),
	firstName: encryptedText("first_name"),
	lastName: encryptedText("last_name"),
	walletAddress: encryptedText("wallet_address"),
	metadata: encryptedJson("metadata"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("sandbox_customers_business_email_key").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.email.asc().nullsLast().op("text_ops")),
	index("sandbox_customers_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_customers_wallet_address_idx").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	uniqueIndex("sandbox_customers_business_wallet_unique").using("btree", table.businessId.asc().nullsLast().op("text_ops"), table.walletAddress.asc().nullsLast().op("text_ops")).where(sql`${table.walletAddress} IS NOT NULL`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_customers_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSubscriptionPlans = pgTable("sandbox_subscription_plans", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	name: text().notNull(),
	description: text(),
	chain: text().notNull(),
	token: text().notNull(),
	active: boolean().default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_plans_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_plans_chain_token_idx").using("btree", table.chain.asc().nullsLast().op("text_ops"), table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_plans_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSubscriptionPrices = pgTable("sandbox_subscription_prices", {
	id: text().primaryKey().notNull(),
	planId: text("plan_id").notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	billingInterval: billingInterval("billing_interval").notNull(),
	intervalCount: integer("interval_count").default(1).notNull(),
	trialPeriodDays: integer("trial_period_days").default(0),
	active: boolean().default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_prices_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("int4_ops")),
	index("sandbox_subscription_prices_billing_interval_idx").using("btree", table.billingInterval.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.planId],
		foreignColumns: [sandboxSubscriptionPlans.id],
		name: "sandbox_subscription_prices_planId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSubscriptions = pgTable("sandbox_subscriptions", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	customerId: text("customer_id").notNull(),
	priceId: text("price_id"), // nullable for metered subscriptions
	authId: text("auth_id"), // on-chain authorization id (bytes32 hex)
	tokenId: text("token_id"), // FK to sandbox_subscription_currencies.id: user's selected payment token
	status: subscriptionStatus().default('ACTIVE').notNull(),
	billingMode: billingMode().default('FIXED').notNull(), // FIXED or METERED
	capAmount: numeric("cap_amount", { precision: 78, scale: 0 }), // max allowance for metered billing (token units)
	maxPerCharge: numeric("max_per_charge", { precision: 78, scale: 0 }), // max amount per single charge (token units)
	authorizationExpiry: timestamp("authorization_expiry", { precision: 3, mode: 'string', withTimezone: true }), // when auth expires
	totalCyclesAllowed: integer("total_cycles_allowed"), // total number of billing cycles allowed for metered subscriptions
	cyclesUsed: integer("cycles_used").default(0), // number of billing cycles used so far
	cycleTrackingEnabled: boolean("cycle_tracking_enabled").default(false).notNull(), // whether to track billing cycles for this subscription
	currentPeriodStart: timestamp("current_period_start", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	currentPeriodEnd: timestamp("current_period_end", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	trialStart: timestamp("trial_start", { precision: 3, mode: 'string', withTimezone: true }),
	trialEnd: timestamp("trial_end", { precision: 3, mode: 'string', withTimezone: true }),
	cancelledAt: timestamp("cancelled_at", { precision: 3, mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
	walletAddress: text("wallet_address"), // customer's payment wallet
	metadata: jsonb(),
	currentRenewalCounter: integer("current_renewal_counter").default(0).notNull(),
	currentPriceId: text("current_price_id"),
	pendingPriceChangeId: text("pending_price_change_id"),
	renewalWindowStart: timestamp("renewal_window_start", { precision: 3, mode: 'string', withTimezone: true }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("sandbox_subscriptions_auth_id_key").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	uniqueIndex("sandbox_subscriptions_customer_price_active_key").using("btree", table.customerId.asc().nullsLast().op("text_ops"), table.priceId.asc().nullsLast().op("text_ops")).where(sql`${table.status} = 'ACTIVE'`),
	index("sandbox_subscriptions_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscriptions_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscriptions_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscriptions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("sandbox_subscriptions_current_period_end_idx").using("btree", table.currentPeriodEnd.asc().nullsLast()),
	index("sandbox_subscriptions_cancel_at_period_end_idx").using("btree", table.cancelAtPeriodEnd.asc().nullsLast().op("bool_ops")).where(sql`${table.cancelAtPeriodEnd} = true`),
	index("sandbox_subscriptions_token_id_idx").using("btree", table.tokenId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscriptions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [sandboxCustomers.id],
		name: "sandbox_subscriptions_customerId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [sandboxSubscriptionPrices.id],
		name: "sandbox_subscriptions_priceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.tokenId],
		foreignColumns: [sandboxSubscriptionCurrencies.id],
		name: "sandbox_subscriptions_tokenId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxSubscriptionInvoices = pgTable("sandbox_subscription_invoices", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	subscriptionId: text("subscription_id").notNull(),
	priceId: text("price_id"), // nullable for metered invoices
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	status: subscriptionInvoiceStatus().default('DRAFT').notNull(),
	periodStart: timestamp("period_start", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	periodEnd: timestamp("period_end", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	dueDate: timestamp("due_date", { precision: 3, mode: 'string', withTimezone: true }).notNull(),
	paidAt: timestamp("paid_at", { precision: 3, mode: 'string', withTimezone: true }),
	voidedAt: timestamp("voided_at", { precision: 3, mode: 'string', withTimezone: true }),
	attemptCount: integer("attempt_count").default(0).notNull(),
	nextPaymentAttempt: timestamp("next_payment_attempt", { precision: 3, mode: 'string', withTimezone: true }),
	processing: boolean().default(false).notNull(),
	onchainInvoiceId: text("onchain_invoice_id"),
	fromAmountUnits: numeric("from_amount_units", { precision: 78, scale: 0 }),
	fromAmountHuman: text("from_amount_human"),
	exchangeRate: numeric("exchange_rate", { precision: 30, scale: 10 }),
	exchangeSource: text("exchange_source"),
	fees: jsonb(),
	quoteExpiresAt: timestamp("quote_expires_at", { precision: 3, mode: 'string', withTimezone: true }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_invoices_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_invoices_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_invoices_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_invoices_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("sandbox_subscription_invoices_due_date_idx").using("btree", table.dueDate.asc().nullsLast()),
	index("sandbox_subscription_invoices_next_attempt_idx").using("btree", table.nextPaymentAttempt.asc().nullsLast()),
	index("sandbox_subscription_invoices_status_next_attempt_processing_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.nextPaymentAttempt.asc().nullsLast(), table.processing.asc().nullsLast().op("bool_ops")),
	index("sandbox_subscription_invoices_onchain_id_idx").using("btree", table.onchainInvoiceId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_invoices_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [sandboxSubscriptions.id],
		name: "sandbox_subscription_invoices_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [sandboxSubscriptionPrices.id],
		name: "sandbox_subscription_invoices_priceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxSubscriptionChargeAttempts = pgTable("sandbox_subscription_charge_attempts", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	invoiceId: text("invoice_id").notNull(),
	transactionId: text("transaction_id"),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	status: chargeStatus().default('PENDING').notNull(),
	walletAddress: text("wallet_address").notNull(),
	transactionHash: text("transaction_hash"),
	blockConfirmations: integer("block_confirmations").default(0),
	chain: text().notNull(),
	failureReason: text("failure_reason"),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_charge_attempts_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_charge_attempts_invoice_id_idx").using("btree", table.invoiceId.asc().nullsLast().op("int4_ops")),
	index("sandbox_subscription_charge_attempts_transaction_id_idx").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_charge_attempts_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("sandbox_subscription_charge_attempts_transaction_hash_idx").using("btree", table.transactionHash.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_charge_attempts_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [sandboxSubscriptionInvoices.id],
		name: "sandbox_subscription_charge_attempts_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.transactionId],
		foreignColumns: [transactions.id],
		name: "sandbox_subscription_charge_attempts_transactionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxPaymentMethods = pgTable("sandbox_payment_methods", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	customerId: text("customer_id").notNull(),
	type: paymentMethodType().notNull(),
	walletAddress: text("wallet_address"),
	chain: text(),
	bankAccount: text("bank_account"),
	mobileNumber: text("mobile_number"),
	approvedSpender: text("approved_spender"),
	tokenContract: text("token_contract"),
	tokenDecimals: integer("token_decimals"),
	allowanceAmount: numeric("allowance_amount", { precision: 78, scale: 0 }),
	authId: text("auth_id"),
	isDefault: boolean("is_default").default(false).notNull(),
	active: boolean().default(true).notNull(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_payment_methods_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_payment_methods_customer_id_idx").using("btree", table.customerId.asc().nullsLast().op("text_ops")),
	index("sandbox_payment_methods_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	index("sandbox_payment_methods_wallet_address_idx").using("btree", table.walletAddress.asc().nullsLast().op("text_ops")),
	index("sandbox_payment_methods_auth_id_idx").using("btree", table.authId.asc().nullsLast().op("text_ops")),
	index("sandbox_payment_methods_token_contract_idx").using("btree", table.tokenContract.asc().nullsLast().op("text_ops")),
	uniqueIndex("sandbox_payment_methods_customer_default_unique").using("btree", table.customerId.asc().nullsLast().op("text_ops")).where(sql`${table.isDefault} = true`),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_payment_methods_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [sandboxCustomers.id],
		name: "sandbox_payment_methods_customerId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxSubscriptionCheckoutSessions = pgTable("sandbox_subscription_checkout_sessions", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	priceId: text("price_id"), // nullable for metered mode
	customerId: text("customer_id"),
	customerEmail: text("customer_email"),
	status: checkoutStatus().default('PENDING').notNull(),
	successUrl: text("success_url"),
	cancelUrl: text("cancel_url"),
	subscriptionId: text("subscription_id"),
	walletAddress: text("wallet_address"),
	chain: text(),
	tokenId: text("token_id"),
	billingMode: billingMode().default('FIXED').notNull(), // FIXED or METERED
	expectedUsageCurrency: text("expected_usage_currency"), // for metered mode expected usage
	expectedUsageAmount: numeric("expected_usage_amount", { precision: 18, scale: 8 }), // for metered mode expected usage
	strategy: text(), // conservative, moderate, liberal, custom
	customMultiplier: numeric("custom_multiplier", { precision: 5, scale: 2 }), // custom multiplier when strategy is custom
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	completedAt: timestamp("completed_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_checkout_sessions_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_checkout_sessions_price_id_idx").using("btree", table.priceId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_checkout_sessions_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("sandbox_subscription_checkout_sessions_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast()),
	index("sandbox_subscription_checkout_sessions_status_expires_at_idx").using("btree", table.status.asc().nullsLast().op("enum_ops"), table.expiresAt.asc().nullsLast()),
	index("sandbox_subscription_checkout_sessions_token_id_idx").using("btree", table.tokenId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_checkout_sessions_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.priceId],
		foreignColumns: [sandboxSubscriptionPrices.id],
		name: "sandbox_subscription_checkout_sessions_priceId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [sandboxCustomers.id],
		name: "sandbox_subscription_checkout_sessions_customerId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [sandboxSubscriptions.id],
		name: "sandbox_subscription_checkout_sessions_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.tokenId],
		foreignColumns: [sandboxSubscriptionCurrencies.id],
		name: "sandbox_subscription_checkout_sessions_tokenId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxSubscriptionEvents = pgTable("sandbox_subscription_events", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	subscriptionId: text("subscription_id"),
	invoiceId: text("invoice_id"),
	customerId: text("customer_id"),
	eventType: text("event_type").notNull(),
	data: jsonb().notNull(),
	processed: boolean().default(false).notNull(),
	processedAt: timestamp("processed_at", { precision: 3, mode: 'string' }),
	webhookDelivered: boolean("webhook_delivered").default(false).notNull(),
	webhookDeliveredAt: timestamp("webhook_delivered_at", { precision: 3, mode: 'string' }),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("sandbox_subscription_events_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_events_subscription_id_idx").using("btree", table.subscriptionId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_events_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_events_processed_idx").using("btree", table.processed.asc().nullsLast().op("bool_ops")),
	index("sandbox_subscription_events_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_events_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionId],
		foreignColumns: [sandboxSubscriptions.id],
		name: "sandbox_subscription_events_subscriptionId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.invoiceId],
		foreignColumns: [sandboxSubscriptionInvoices.id],
		name: "sandbox_subscription_events_invoiceId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.customerId],
		foreignColumns: [sandboxCustomers.id],
		name: "sandbox_subscription_events_customerId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const sandboxSubscriptionLinks = pgTable("sandbox_subscription_links", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id").notNull(),
	planId: text("plan_id").notNull(),
	slug: text().notNull(),
	title: text().notNull(),
	description: text(),
	status: subscriptionLinkStatus().default('ACTIVE').notNull(),
	expiresAt: timestamp("expires_at", { precision: 3, mode: 'string' }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("sandbox_subscription_links_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_links_business_id_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_links_plan_id_idx").using("btree", table.planId.asc().nullsLast().op("text_ops")),
	index("sandbox_subscription_links_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "sandbox_subscription_links_businessId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.planId],
		foreignColumns: [sandboxSubscriptionPlans.id],
		name: "sandbox_subscription_links_planId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const waitlist = pgTable("waitlist", {
	id: text().primaryKey().notNull(),
	businessName: text("business_name").notNull(),
	email: text("email").notNull(),
	phone: encryptedText("phone"),
	website: text(),
	industry: text(),
	country: text(),
	businessType: text("business_type"),
	monthlyVolume: text("monthly_volume"),
	paymentMethods: text("payment_methods").array(),
	interests: text().array(),
	additionalInfo: encryptedText("additional_info"),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("waitlist_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("waitlist_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
	index("waitlist_country_idx").using("btree", table.country.asc().nullsLast().op("text_ops")),
	index("waitlist_industry_idx").using("btree", table.industry.asc().nullsLast().op("text_ops")),
]);

// =========================
// Support system tables
// =========================

export const supportTickets = pgTable("support_tickets", {
	id: text().primaryKey().notNull(),
	// Optional business context (if ticket is for a business account)
	businessId: text(),
	// Customer who created the ticket
	userId: text(),
	subject: encryptedText("subject").notNull(),
	status: supportTicketStatus().default('OPEN').notNull(),
	priority: notificationPriority().default('NORMAL').notNull(),
	category: supportTicketCategory().default('GENERAL').notNull(),
	// Assignment
	assignedAdminId: text("assigned_admin_id"),
	assignedAt: timestamp("assigned_at", { precision: 3, mode: 'string' }),
	assignedByAdminId: text("assigned_by_admin_id"),
	// Locking (when an agent is actively responding)
	isLocked: boolean("is_locked").default(false).notNull(),
	lockedByAdminId: text("locked_by_admin_id"),
	lockedAt: timestamp("locked_at", { precision: 3, mode: 'string' }),
	lockExpiresAt: timestamp("lock_expires_at", { precision: 3, mode: 'string' }),
	// Activity snapshots
	messagesCount: integer("messages_count").default(0).notNull(),
	watchersCount: integer("watchers_count").default(0).notNull(),
	lastMessageAt: timestamp("last_message_at", { precision: 3, mode: 'string' }),
	lastMessageFromRole: text("last_message_from_role"), // 'USER' | 'ADMIN'
	// Lifecycle timestamps
	resolvedAt: timestamp("resolved_at", { precision: 3, mode: 'string' }),
	closedAt: timestamp("closed_at", { precision: 3, mode: 'string' }),
	escalatedAt: timestamp("escalated_at", { precision: 3, mode: 'string' }),
	escalatedByAdminId: text("escalated_by_admin_id"),
	// Metadata
	metadata: encryptedJson("metadata"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("support_tickets_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("support_tickets_priority_idx").using("btree", table.priority.asc().nullsLast().op("enum_ops")),
	index("support_tickets_category_idx").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("support_tickets_businessId_idx").using("btree", table.businessId.asc().nullsLast().op("text_ops")),
	index("support_tickets_assigned_admin_idx").using("btree", table.assignedAdminId.asc().nullsLast().op("text_ops")),
	index("support_tickets_locked_admin_idx").using("btree", table.lockedByAdminId.asc().nullsLast().op("text_ops")),
	index("support_tickets_last_message_at_idx").using("btree", table.lastMessageAt.asc().nullsLast()),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "support_tickets_businessId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "support_tickets_userId_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.assignedAdminId],
		foreignColumns: [admins.id],
		name: "support_tickets_assigned_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.assignedByAdminId],
		foreignColumns: [admins.id],
		name: "support_tickets_assigned_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.lockedByAdminId],
		foreignColumns: [admins.id],
		name: "support_tickets_locked_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.escalatedByAdminId],
		foreignColumns: [admins.id],
		name: "support_tickets_escalated_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const supportTicketMessages = pgTable("support_ticket_messages", {
	id: text().primaryKey().notNull(),
	ticketId: text("ticket_id").notNull(),
	// exactly one of senderUserId or senderAdminId should be set
	senderUserId: text("sender_user_id"),
	senderAdminId: text("sender_admin_id"),
	type: supportMessageType().default('MESSAGE').notNull(),
	content: encryptedText("content").notNull(),
	contentFormat: text("content_format").default('PLAINTEXT'), // 'PLAINTEXT' | 'MARKDOWN' | 'HTML'
	isInternal: boolean("is_internal").default(false).notNull(), // internal notes visible only to admins
	isEdited: boolean("is_edited").default(false).notNull(),
	editedAt: timestamp("edited_at", { precision: 3, mode: 'string' }),
	quotedMessageId: text("quoted_message_id"),
	metadata: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	index("support_ticket_messages_ticket_id_idx").using("btree", table.ticketId.asc().nullsLast().op("text_ops")),
	index("support_ticket_messages_sender_admin_idx").using("btree", table.senderAdminId.asc().nullsLast().op("text_ops")),
	index("support_ticket_messages_sender_user_idx").using("btree", table.senderUserId.asc().nullsLast().op("text_ops")),
	index("support_ticket_messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
	foreignKey({
		columns: [table.ticketId],
		foreignColumns: [supportTickets.id],
		name: "support_ticket_messages_ticket_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.senderAdminId],
		foreignColumns: [admins.id],
		name: "support_ticket_messages_sender_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.senderUserId],
		foreignColumns: [users.id],
		name: "support_ticket_messages_sender_user_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	// Self-referential FK (quoted message -> message.id). Use table.id to avoid circular reference
	foreignKey({
		columns: [table.quotedMessageId],
		foreignColumns: [table.id],
		name: "support_ticket_messages_quoted_message_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const supportTicketAttachments = pgTable("support_ticket_attachments", {
	id: text().primaryKey().notNull(),
	messageId: text("message_id").notNull(),
	url: text().notNull(),
	filename: text().notNull(),
	contentType: text("content_type"),
	sizeBytes: integer("size_bytes"),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("support_ticket_attachments_message_id_idx").using("btree", table.messageId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.messageId],
		foreignColumns: [supportTicketMessages.id],
		name: "support_ticket_attachments_message_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const supportTicketAssignments = pgTable("support_ticket_assignments", {
	id: text().primaryKey().notNull(),
	ticketId: text("ticket_id").notNull(),
	adminId: text("admin_id").notNull(),
	assignedByAdminId: text("assigned_by_admin_id"),
	reason: text(),
	active: boolean().default(true).notNull(),
	assignedAt: timestamp("assigned_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	unassignedAt: timestamp("unassigned_at", { precision: 3, mode: 'string' }),
}, (table) => [
	index("support_ticket_assignments_ticket_id_idx").using("btree", table.ticketId.asc().nullsLast().op("text_ops")),
	index("support_ticket_assignments_admin_id_idx").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	uniqueIndex("support_ticket_assignments_active_unique").using("btree", table.ticketId.asc().nullsLast().op("text_ops"), table.adminId.asc().nullsLast().op("text_ops")).where(sql`${table.active} = true`),
	foreignKey({
		columns: [table.ticketId],
		foreignColumns: [supportTickets.id],
		name: "support_ticket_assignments_ticket_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.adminId],
		foreignColumns: [admins.id],
		name: "support_ticket_assignments_admin_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.assignedByAdminId],
		foreignColumns: [admins.id],
		name: "support_ticket_assignments_assigned_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const supportTicketLocks = pgTable("support_ticket_locks", {
	id: text().primaryKey().notNull(),
	ticketId: text("ticket_id").notNull(),
	lockedByAdminId: text("locked_by_admin_id").notNull(),
	lockedAt: timestamp("locked_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lockExpiresAt: timestamp("lock_expires_at", { precision: 3, mode: 'string' }),
	unlockedAt: timestamp("unlocked_at", { precision: 3, mode: 'string' }),
	unlockReason: text("unlock_reason"),
}, (table) => [
	index("support_ticket_locks_ticket_id_idx").using("btree", table.ticketId.asc().nullsLast().op("text_ops")),
	index("support_ticket_locks_locked_by_admin_id_idx").using("btree", table.lockedByAdminId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.ticketId],
		foreignColumns: [supportTickets.id],
		name: "support_ticket_locks_ticket_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.lockedByAdminId],
		foreignColumns: [admins.id],
		name: "support_ticket_locks_locked_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const supportTicketWatchers = pgTable("support_ticket_watchers", {
	id: text().primaryKey().notNull(),
	ticketId: text("ticket_id").notNull(),
	adminId: text("admin_id").notNull(),
	addedByAdminId: text("added_by_admin_id"),
	emailOnNewMessage: boolean("email_on_new_message").default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("support_ticket_watchers_ticket_admin_unique").using("btree", table.ticketId.asc().nullsLast().op("text_ops"), table.adminId.asc().nullsLast().op("text_ops")),
	index("support_ticket_watchers_admin_id_idx").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.ticketId],
		foreignColumns: [supportTickets.id],
		name: "support_ticket_watchers_ticket_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.adminId],
		foreignColumns: [admins.id],
		name: "support_ticket_watchers_admin_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.addedByAdminId],
		foreignColumns: [admins.id],
		name: "support_ticket_watchers_added_by_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const supportTicketEvents = pgTable("support_ticket_events", {
	id: text().primaryKey().notNull(),
	ticketId: text("ticket_id").notNull(),
	eventType: text("event_type").notNull(), // e.g. TICKET_CREATED, ASSIGNED, LOCKED, MESSAGE_ADDED, STATUS_CHANGED
	actorAdminId: text("actor_admin_id"),
	actorUserId: text("actor_user_id"),
	details: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("support_ticket_events_ticket_id_idx").using("btree", table.ticketId.asc().nullsLast().op("text_ops")),
	index("support_ticket_events_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
	index("support_ticket_events_created_at_idx").using("btree", table.createdAt.asc().nullsLast()),
	foreignKey({
		columns: [table.ticketId],
		foreignColumns: [supportTickets.id],
		name: "support_ticket_events_ticket_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.actorAdminId],
		foreignColumns: [admins.id],
		name: "support_ticket_events_actor_admin_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
		columns: [table.actorUserId],
		foreignColumns: [users.id],
		name: "support_ticket_events_actor_user_id_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const coachingStudentRequests = pgTable("coaching_student_requests", {
	id: text().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	coachingPaymentId: text("coaching_payment_id"),
	subscriptionLinkId: text("subscription_link_id"),
	name: text().notNull(),
	email: text(),
	phone: text(),
	status: coachingStudentRequestStatus().default('pending').notNull(),
	uniqueToken: text("unique_token").notNull(),
	personalPaymentLink: text("personal_payment_link").notNull(),
	transactionId: text("transaction_id"),
	requestedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paidAt: timestamp({ precision: 3, mode: 'string' }),
	lastReminderAt: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("coaching_student_requests_unique_token_key").using("btree", table.uniqueToken.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.coachingPaymentId],
		foreignColumns: [coachingPaymentLinks.id],
		name: "coaching_student_requests_coachingPaymentId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionLinkId],
		foreignColumns: [subscriptionLinks.id],
		name: "coaching_student_requests_subscriptionLinkId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandboxCoachingStudentRequests = pgTable("sandbox_coaching_student_requests", {
	id: text().primaryKey().default(sql`gen_random_uuid()`).notNull(),
	coachingPaymentId: text("coaching_payment_id"),
	subscriptionLinkId: text("subscription_link_id"),
	name: text().notNull(),
	email: text(),
	phone: text(),
	status: coachingStudentRequestStatus().default('pending').notNull(),
	uniqueToken: text("unique_token").notNull(),
	personalPaymentLink: text("personal_payment_link").notNull(),
	transactionId: text("transaction_id"),
	requestedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	paidAt: timestamp({ precision: 3, mode: 'string' }),
	lastReminderAt: timestamp({ precision: 3, mode: 'string' }),
}, (table) => [
	uniqueIndex("sandbox_coaching_student_requests_unique_token_key").using("btree", table.uniqueToken.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.coachingPaymentId],
		foreignColumns: [sandboxCoachingPaymentLinks.id],
		name: "sandbox_coaching_student_requests_coachingPaymentId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.subscriptionLinkId],
		foreignColumns: [sandboxSubscriptionLinks.id],
		name: "sandbox_coaching_student_requests_subscriptionLinkId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const blogPosts = pgTable("blog_posts", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	excerpt: text(),
	content: text().notNull(),
	featuredImage: text("featured_image"),
	authorId: text("author_id").notNull(),
	status: blogStatus().default('DRAFT').notNull(),
	publishedAt: timestamp("published_at", { precision: 3, mode: 'string' }),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
	lockedBy: text("locked_by"),
	lockedAt: timestamp("locked_at", { precision: 3, mode: 'string' }),
	tags: text().array(),
}, (table) => [
	uniqueIndex("blog_posts_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("blog_posts_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("blog_posts_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.authorId],
		foreignColumns: [admins.id],
		name: "blog_posts_authorId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
		columns: [table.lockedBy],
		foreignColumns: [admins.id],
		name: "blog_posts_lockedBy_fkey"
	}).onUpdate("cascade").onDelete("set null"),
]);

export const kuvarIdentities = pgTable("kuvar_identities", {
	id: text("id").primaryKey().notNull(),
	email: encryptedText("email").notNull(),
	fullName: encryptedText("full_name").notNull(),
	tokenHash: text("token_hash").notNull(),
	consentAt: timestamp("consent_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).notNull(),
}, (table) => [
	uniqueIndex("kuvar_identities_token_hash_key").using("btree", table.tokenHash.asc().nullsLast().op("text_ops")),
	index("kuvar_identities_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);
export const ledgerAccounts = pgTable("ledger_accounts", {
	id: text().primaryKey().notNull(),
	businessId: text("business_id"), // Nullable for platform accounts
	type: ledgerAccountType().notNull(),
	currency: text().notNull(),
	currentBalance: numeric("current_balance", { precision: 18, scale: 8 }).default('0').notNull(),
	pendingBalance: numeric("pending_balance", { precision: 18, scale: 8 }).default('0').notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ledger_accounts_business_id_idx").using("btree", table.businessId),
	index("ledger_accounts_type_idx").using("btree", table.type),
	foreignKey({
		columns: [table.businessId],
		foreignColumns: [businesses.id],
		name: "ledger_accounts_business_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);

export const ledgerEntries = pgTable("ledger_entries", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	type: ledgerEntryType().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	currency: text().notNull(),
	balanceBefore: numeric("balance_before", { precision: 18, scale: 8 }).notNull(),
	balanceAfter: numeric("balance_after", { precision: 18, scale: 8 }).notNull(),
	referenceType: text("reference_type"), // 'TRANSACTION', 'SETTLEMENT', 'INVOICE', etc.
	referenceId: text("reference_id"),
	description: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ledger_entries_account_id_idx").using("btree", table.accountId),
	index("ledger_entries_reference_idx").using("btree", table.referenceType, table.referenceId),
	foreignKey({
		columns: [table.accountId],
		foreignColumns: [ledgerAccounts.id],
		name: "ledger_entries_account_id_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
]);
export const pendingRefunds = pgTable("pending_refunds", {
	id: text().primaryKey().notNull(),
	transactionId: text().notNull(),
	walletAddress: text().notNull(),
	refundAddress: text().notNull(),
	network: text().notNull(),
	currency: text().notNull(),
	amount: numeric({ precision: 18, scale: 8 }).notNull(),
	usdValue: numeric({ precision: 18, scale: 8 }),
	status: refundStatus().default('PENDING').notNull(),
	transferHash: text(),
	lastError: text(),
	retryCount: integer().default(0).notNull(),
	nextRetryAt: timestamp({ precision: 3, mode: 'string' }),
	createdAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
		columns: [table.transactionId],
		foreignColumns: [transactions.id],
		name: "pending_refunds_transactionId_fkey"
	}).onUpdate("cascade").onDelete("cascade"),
	index("pending_refunds_status_idx").on(table.status),
	index("pending_refunds_next_retry_at_idx").on(table.nextRetryAt),
]);
