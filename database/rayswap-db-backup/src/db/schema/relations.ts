import { relations } from "drizzle-orm/relations";
import { businesses, teamMembers, users, invoices, paymentLinks, invoiceItems, settlements, settlementAccounts, apiKeys, webhooks, admins, adminActivityLogs, whitelistedDomains, sandboxTransactions, sandboxCheckoutSessions, sandboxInvoices, sandboxPaymentLinks, sandboxInvoiceItems, sandboxWebhooks, businessDocuments, wallets, notifications, adminNotifications, sandboxSettlements, kycVerifications, checkoutSessions, settlementPayouts, gasFunding, customRoles, webhookLogs, transactions, flutterwaveBanks, flutterwaveBankBranches } from "./schema";

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	business: one(businesses, {
		fields: [teamMembers.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	}),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
	teamMembers: many(teamMembers),
	invoices: many(invoices),
	paymentLinks: many(paymentLinks),
	settlements: many(settlements),
	apiKeys: many(apiKeys),
	webhooks: many(webhooks),
	whitelistedDomains: many(whitelistedDomains),
	sandboxTransactions: many(sandboxTransactions),
	sandboxInvoices: many(sandboxInvoices),
	sandboxWebhooks: many(sandboxWebhooks),
	businessDocuments: many(businessDocuments),
	wallets: many(wallets),
	notifications: many(notifications),
	sandboxPaymentLinks: many(sandboxPaymentLinks),
	sandboxSettlements: many(sandboxSettlements),
	kycVerifications: many(kycVerifications),
	checkoutSessions: many(checkoutSessions),
	gasFundings: many(gasFunding),
	settlementAccounts: many(settlementAccounts),
	user: one(users, {
		fields: [businesses.ownerId],
		references: [users.id]
	}),
	sandboxCheckoutSessions: many(sandboxCheckoutSessions),
	webhookLogs: many(webhookLogs),
	transactions: many(transactions),
}));

export const usersRelations = relations(users, ({ many }) => ({
	teamMembers: many(teamMembers),
	notifications: many(notifications),
	kycVerifications: many(kycVerifications),
	businesses: many(businesses),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	business: one(businesses, {
		fields: [invoices.businessId],
		references: [businesses.id]
	}),
	invoiceItems: many(invoiceItems),
	transactions: many(transactions),
}));

export const paymentLinksRelations = relations(paymentLinks, ({ one, many }) => ({
	business: one(businesses, {
		fields: [paymentLinks.businessId],
		references: [businesses.id]
	}),
	transactions: many(transactions),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
	invoice: one(invoices, {
		fields: [invoiceItems.invoiceId],
		references: [invoices.id]
	}),
}));

export const settlementsRelations = relations(settlements, ({ one, many }) => ({
	business: one(businesses, {
		fields: [settlements.businessId],
		references: [businesses.id]
	}),
	settlementAccount: one(settlementAccounts, {
		fields: [settlements.settlementAccountId],
		references: [settlementAccounts.id]
	}),
	settlementPayouts: many(settlementPayouts),
	transactions: many(transactions),
}));

export const settlementAccountsRelations = relations(settlementAccounts, ({ one, many }) => ({
	settlements: many(settlements),
	settlementPayouts: many(settlementPayouts),
	business: one(businesses, {
		fields: [settlementAccounts.businessId],
		references: [businesses.id]
	}),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
	business: one(businesses, {
		fields: [apiKeys.businessId],
		references: [businesses.id]
	}),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
	business: one(businesses, {
		fields: [webhooks.businessId],
		references: [businesses.id]
	}),
}));

export const adminActivityLogsRelations = relations(adminActivityLogs, ({ one }) => ({
	admin: one(admins, {
		fields: [adminActivityLogs.adminId],
		references: [admins.id]
	}),
}));

export const adminsRelations = relations(admins, ({ one, many }) => ({
	adminActivityLogs: many(adminActivityLogs),
	adminNotifications: many(adminNotifications),
	customRole: one(customRoles, {
		fields: [admins.customRoleId],
		references: [customRoles.id]
	}),
}));

export const whitelistedDomainsRelations = relations(whitelistedDomains, ({ one }) => ({
	business: one(businesses, {
		fields: [whitelistedDomains.businessId],
		references: [businesses.id]
	}),
}));

export const sandboxTransactionsRelations = relations(sandboxTransactions, ({ one }) => ({
	business: one(businesses, {
		fields: [sandboxTransactions.businessId],
		references: [businesses.id]
	}),
	sandboxCheckoutSession: one(sandboxCheckoutSessions, {
		fields: [sandboxTransactions.checkoutSessionId],
		references: [sandboxCheckoutSessions.id]
	}),
	sandboxInvoice: one(sandboxInvoices, {
		fields: [sandboxTransactions.invoiceId],
		references: [sandboxInvoices.id]
	}),
	sandboxPaymentLink: one(sandboxPaymentLinks, {
		fields: [sandboxTransactions.paymentLinkId],
		references: [sandboxPaymentLinks.id]
	}),
}));

export const sandboxCheckoutSessionsRelations = relations(sandboxCheckoutSessions, ({ one, many }) => ({
	sandboxTransactions: many(sandboxTransactions),
	business: one(businesses, {
		fields: [sandboxCheckoutSessions.businessId],
		references: [businesses.id]
	}),
}));

export const sandboxInvoicesRelations = relations(sandboxInvoices, ({ one, many }) => ({
	sandboxTransactions: many(sandboxTransactions),
	business: one(businesses, {
		fields: [sandboxInvoices.businessId],
		references: [businesses.id]
	}),
	sandboxInvoiceItems: many(sandboxInvoiceItems),
}));

export const sandboxPaymentLinksRelations = relations(sandboxPaymentLinks, ({ one, many }) => ({
	sandboxTransactions: many(sandboxTransactions),
	business: one(businesses, {
		fields: [sandboxPaymentLinks.businessId],
		references: [businesses.id]
	}),
}));

export const sandboxInvoiceItemsRelations = relations(sandboxInvoiceItems, ({ one }) => ({
	sandboxInvoice: one(sandboxInvoices, {
		fields: [sandboxInvoiceItems.invoiceId],
		references: [sandboxInvoices.id]
	}),
}));

export const sandboxWebhooksRelations = relations(sandboxWebhooks, ({ one }) => ({
	business: one(businesses, {
		fields: [sandboxWebhooks.businessId],
		references: [businesses.id]
	}),
}));

export const businessDocumentsRelations = relations(businessDocuments, ({ one }) => ({
	business: one(businesses, {
		fields: [businessDocuments.businessId],
		references: [businesses.id]
	}),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
	business: one(businesses, {
		fields: [wallets.businessId],
		references: [businesses.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	business: one(businesses, {
		fields: [notifications.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const adminNotificationsRelations = relations(adminNotifications, ({ one }) => ({
	admin: one(admins, {
		fields: [adminNotifications.adminId],
		references: [admins.id]
	}),
}));

export const sandboxSettlementsRelations = relations(sandboxSettlements, ({ one }) => ({
	business: one(businesses, {
		fields: [sandboxSettlements.businessId],
		references: [businesses.id]
	}),
}));

export const kycVerificationsRelations = relations(kycVerifications, ({ one }) => ({
	business: one(businesses, {
		fields: [kycVerifications.businessId],
		references: [businesses.id]
	}),
	user: one(users, {
		fields: [kycVerifications.userId],
		references: [users.id]
	}),
}));

export const checkoutSessionsRelations = relations(checkoutSessions, ({ one, many }) => ({
	business: one(businesses, {
		fields: [checkoutSessions.businessId],
		references: [businesses.id]
	}),
	transactions: many(transactions),
}));

export const settlementPayoutsRelations = relations(settlementPayouts, ({ one }) => ({
	settlementAccount: one(settlementAccounts, {
		fields: [settlementPayouts.settlementAccountId],
		references: [settlementAccounts.id]
	}),
	settlement: one(settlements, {
		fields: [settlementPayouts.settlementId],
		references: [settlements.id]
	}),
}));

export const gasFundingRelations = relations(gasFunding, ({ one }) => ({
	business: one(businesses, {
		fields: [gasFunding.businessId],
		references: [businesses.id]
	}),
}));

export const customRolesRelations = relations(customRoles, ({ many }) => ({
	admins: many(admins),
}));

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
	business: one(businesses, {
		fields: [webhookLogs.businessId],
		references: [businesses.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
	business: one(businesses, {
		fields: [transactions.businessId],
		references: [businesses.id]
	}),
	checkoutSession: one(checkoutSessions, {
		fields: [transactions.checkoutSessionId],
		references: [checkoutSessions.id]
	}),
	invoice: one(invoices, {
		fields: [transactions.invoiceId],
		references: [invoices.id]
	}),
	paymentLink: one(paymentLinks, {
		fields: [transactions.paymentLinkId],
		references: [paymentLinks.id]
	}),
	settlement: one(settlements, {
		fields: [transactions.settlementId],
		references: [settlements.id]
	}),
}));

// New relations: Flutterwave banks -> branches
export const flutterwaveBanksRelations = relations(flutterwaveBanks, ({ many }) => ({
	branches: many(flutterwaveBankBranches),
}));

export const flutterwaveBankBranchesRelations = relations(flutterwaveBankBranches, ({ one }) => ({
	bank: one(flutterwaveBanks, {
		fields: [flutterwaveBankBranches.flutterwaveBankId],
		references: [flutterwaveBanks.id],
	}),
}));