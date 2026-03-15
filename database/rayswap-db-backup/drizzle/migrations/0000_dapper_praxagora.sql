CREATE TYPE "public"."AdminRole" AS ENUM('ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."ApiKeyStatus" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."ApiKeyType" AS ENUM('LIVE', 'SANDBOX');--> statement-breakpoint
CREATE TYPE "public"."CheckoutStatus" AS ENUM('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED', 'PROCESSING', 'FAILED', 'PARTIAL_PAYMENT', 'EXCESS_PAYMENT', 'ARMED', 'EXPIRED_WITH_PAYMENT_PROCESSING', 'COMPLIANCE_HOLD');--> statement-breakpoint
CREATE TYPE "public"."DocumentStatus" AS ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."DocumentType" AS ENUM('BUSINESS_REGISTRATION', 'TAX_CERTIFICATE', 'BANK_STATEMENT', 'IDENTITY_DOCUMENT', 'PROOF_OF_ADDRESS', 'MEMORANDUM', 'ARTICLES_OF_INCORPORATION', 'DIRECTORS_RESOLUTION', 'BENEFICIAL_OWNERSHIP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."GasFundingStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NOT_NEEDED');--> statement-breakpoint
CREATE TYPE "public"."InvoiceStatus" AS ENUM('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."NotificationPriority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('TRANSACTION', 'PAYMENT', 'SETTLEMENT', 'SECURITY', 'SYSTEM', 'BUSINESS', 'VERIFICATION', 'WEBHOOK', 'API');--> statement-breakpoint
CREATE TYPE "public"."OnboardingStatus" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."PaymentLinkStatus" AS ENUM('ACTIVE', 'INACTIVE', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."PayoutStatus" AS ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."SettlementAccountType" AS ENUM('BANK_TRANSFER', 'MOBILE_MONEY');--> statement-breakpoint
CREATE TYPE "public"."SettlementPayoutStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."SettlementStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."SweepStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."TeamMemberStatus" AS ENUM('PENDING', 'ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."TeamRole" AS ENUM('OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'DEVELOPER', 'SUPPORT');--> statement-breakpoint
CREATE TYPE "public"."TransactionStatus" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'PARTIAL_PAYMENT', 'EXCESS_PAYMENT', 'COMPLIANCE_HOLD');--> statement-breakpoint
CREATE TYPE "public"."VerificationStatus" AS ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."WebhookStatus" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "admin_activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"adminId" text NOT NULL,
	"action" text NOT NULL,
	"resource" text,
	"resourceId" text,
	"details" jsonb,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"adminId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" "NotificationPriority" DEFAULT 'NORMAL' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp(3),
	"actionUrl" text,
	"actionText" text,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"password" text,
	"role" "AdminRole" DEFAULT 'ADMIN' NOT NULL,
	"permissions" text[],
	"isActive" boolean DEFAULT true NOT NULL,
	"lastLoginAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"profileImageUrl" text,
	"customRoleId" text,
	"onboardingToken" text,
	"onboardingTokenExpiry" timestamp(3),
	"twoFactorBackupCodes" text[] DEFAULT '{"RAY"}',
	"twoFactorEnabled" boolean DEFAULT false NOT NULL,
	"twoFactorSecret" text
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"name" text NOT NULL,
	"keyHash" text NOT NULL,
	"keyPrefix" text NOT NULL,
	"status" "ApiKeyStatus" DEFAULT 'ACTIVE' NOT NULL,
	"lastUsedAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"expiresAt" timestamp(3),
	"permissions" text[] DEFAULT '{"RAY"}',
	"type" "ApiKeyType" DEFAULT 'LIVE' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"type" "DocumentType" NOT NULL,
	"fileName" text NOT NULL,
	"fileUrl" text NOT NULL,
	"fileSize" integer NOT NULL,
	"mimeType" text NOT NULL,
	"status" "DocumentStatus" DEFAULT 'PENDING' NOT NULL,
	"uploadedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"verifiedAt" timestamp(3),
	"rejectedAt" timestamp(3),
	"rejectionReason" text,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"address" text,
	"website" text,
	"ownerId" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"businessRegistrationDoc" text,
	"country" text,
	"description" text,
	"industry" text,
	"isSandboxMode" boolean DEFAULT true NOT NULL,
	"onboardingStatus" "OnboardingStatus" DEFAULT 'PENDING' NOT NULL,
	"supportingDocs" text[],
	"taxIdNumber" text,
	"verificationStatus" "VerificationStatus" DEFAULT 'PENDING' NOT NULL,
	"businessType" text,
	"currency" text,
	"logo" text,
	"numberOfDirectors" integer,
	"numberOfShareholders" integer,
	"smileIdVerificationDate" timestamp(3),
	"smileIdVerified" boolean DEFAULT false NOT NULL,
	"uboDeclaration" jsonb,
	"deletedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "checkout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"description" text,
	"status" "CheckoutStatus" DEFAULT 'PENDING' NOT NULL,
	"expiresAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"refund_address" text,
	"deposit_address" text,
	"active_transaction_id" text,
	"payment_tolerance" numeric(10, 8) DEFAULT '0.01',
	"armed_at" timestamp(3),
	"completed_at" timestamp(3),
	"from_currency" text,
	"from_network" text,
	"has_active_payment" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"ticker" text NOT NULL,
	"network" text NOT NULL,
	"name" text,
	"imageUrl" text,
	"tokenContract" text,
	"legacyTicker" text,
	"lastUpdated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currency_aggregates" (
	"id" text PRIMARY KEY NOT NULL,
	"currency" text NOT NULL,
	"totalAmount" numeric(18, 2) DEFAULT '0' NOT NULL,
	"totalTransactions" integer DEFAULT 0 NOT NULL,
	"lastUpdated" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"totalUsdValue" numeric(18, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"permissions" text[],
	"isActive" boolean DEFAULT true NOT NULL,
	"createdBy" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dkim_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"selector" text NOT NULL,
	"privateKey" text NOT NULL,
	"publicKey" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"lastUsedAt" timestamp(3),
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"baseCurrency" text NOT NULL,
	"targetCurrency" text NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"source" text DEFAULT 'exchangerate-api' NOT NULL,
	"fetchedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"validUntil" timestamp(3) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flutterwave_banks" (
	"id" text PRIMARY KEY NOT NULL,
	"bank_id" integer NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"currency" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flutterwave_mobile_networks" (
	"id" text PRIMARY KEY NOT NULL,
	"network_code" text NOT NULL,
	"network_name" text NOT NULL,
	"country" text NOT NULL,
	"currency" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fund_sweep_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp(3) NOT NULL,
	"total_swept" numeric(20, 8) DEFAULT '0' NOT NULL,
	"total_usdt_converted" numeric(20, 8) DEFAULT '0' NOT NULL,
	"wallets_swept" integer DEFAULT 0 NOT NULL,
	"conversions_count" integer DEFAULT 0 NOT NULL,
	"errors_count" integer DEFAULT 0 NOT NULL,
	"details" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gas_funding" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"walletAddress" text NOT NULL,
	"network" text NOT NULL,
	"amount" text NOT NULL,
	"transactionType" text DEFAULT 'transfer' NOT NULL,
	"status" "GasFundingStatus" DEFAULT 'PENDING' NOT NULL,
	"txHash" text,
	"errorMessage" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"completedAt" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "generated_wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"blockchain" text NOT NULL,
	"network" text NOT NULL,
	"encryptedPrivateKey" text NOT NULL,
	"businessId" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"referenceId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"response_data" jsonb,
	"status_code" integer,
	"created_at" timestamp(3) DEFAULT NOW() NOT NULL,
	"expires_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(18, 2) NOT NULL,
	"total" numeric(18, 2) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"customerName" text NOT NULL,
	"customerEmail" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"description" text,
	"status" "InvoiceStatus" DEFAULT 'DRAFT' NOT NULL,
	"dueDate" timestamp(3),
	"paidAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"invoiceNumber" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"businessId" text,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" "NotificationPriority" DEFAULT 'NORMAL' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"readAt" timestamp(3),
	"actionUrl" text,
	"actionText" text,
	"metadata" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_fiat_rates" (
	"id" text PRIMARY KEY NOT NULL,
	"currency" text NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"source" text DEFAULT 'cryptocompare' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_links" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(18, 2),
	"currency" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"status" "PaymentLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expiresAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pending_sweeps" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"wallet_address" text NOT NULL,
	"network" text NOT NULL,
	"currency" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"usd_value" numeric(18, 2),
	"status" "SweepStatus" DEFAULT 'PENDING' NOT NULL,
	"destination" text,
	"transfer_hash" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"next_retry_at" timestamp(3),
	"discovered_token_contract" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "processed_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"transactionId" text NOT NULL,
	"processedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"processType" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_checkout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"currency" text NOT NULL,
	"description" text,
	"status" "CheckoutStatus" DEFAULT 'PENDING' NOT NULL,
	"expiresAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"refund_address" text,
	"deposit_address" text,
	"active_transaction_id" text,
	"payment_tolerance" numeric(10, 8) DEFAULT '0.01',
	"armed_at" timestamp(3),
	"completed_at" timestamp(3),
	"from_currency" text,
	"from_network" text,
	"has_active_payment" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_invoice_items" (
	"id" text PRIMARY KEY NOT NULL,
	"invoiceId" text NOT NULL,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPrice" numeric(18, 2) NOT NULL,
	"total" numeric(18, 2) NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"customerName" text NOT NULL,
	"customerEmail" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"description" text,
	"status" "InvoiceStatus" DEFAULT 'DRAFT' NOT NULL,
	"dueDate" timestamp(3),
	"paidAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"invoiceNumber" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sandbox_payment_links" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"title" text NOT NULL,
	"amount" numeric(18, 2),
	"currency" text NOT NULL,
	"description" text,
	"slug" text NOT NULL,
	"status" "PaymentLinkStatus" DEFAULT 'ACTIVE' NOT NULL,
	"expiresAt" timestamp(3),
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"bankAccount" text NOT NULL,
	"bankName" text NOT NULL,
	"bankCode" text,
	"accountName" text,
	"status" "SettlementStatus" DEFAULT 'PENDING' NOT NULL,
	"transactionCount" integer DEFAULT 0 NOT NULL,
	"fees" numeric(18, 2) DEFAULT '0' NOT NULL,
	"requestedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"processedAt" timestamp(3),
	"completedAt" timestamp(3),
	"failureReason" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sandbox_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"reference" text,
	"customerName" text,
	"customerEmail" text,
	"fromCurrency" text,
	"fromNetwork" text,
	"fromAmount" numeric(18, 8),
	"toCurrency" text,
	"toNetwork" text,
	"toAmount" numeric(18, 8),
	"walletAddress" text,
	"amount" numeric(18, 8),
	"cryptoAmount" numeric(18, 8),
	"currency" text,
	"cryptoCurrency" text,
	"depositAddress" text,
	"walletReferenceId" text,
	"addressSource" text,
	"bankCode" text,
	"accountNumber" text,
	"accountName" text,
	"isMobileMoney" boolean DEFAULT false,
	"type" text DEFAULT 'crypto',
	"status" "TransactionStatus" DEFAULT 'PENDING' NOT NULL,
	"payoutStatus" "PayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"transactionHash" text,
	"txHash" text,
	"blockConfirmations" integer DEFAULT 0,
	"actualAmount" numeric(18, 8),
	"fees" numeric(18, 8),
	"exchangeRate" numeric(18, 8),
	"notes" text,
	"externalId" text,
	"estimatedUsdtAmount" numeric(18, 8),
	"callbackUrl" text,
	"redirectUrl" text,
	"description" text,
	"invoiceId" text,
	"paymentLinkId" text,
	"expiresAt" timestamp(3),
	"expectedAmount" numeric(18, 8),
	"refundAddress" text,
	"refundTxHash" text,
	"refundAmount" numeric(18, 8),
	"paymentTolerance" numeric(5, 4) DEFAULT '0.01',
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"checkoutSessionId" text,
	"completedAt" timestamp(3),
	"errorCode" text,
	"failureReason" text,
	"refundHash" text,
	"refundStatus" text DEFAULT 'PENDING',
	"payment_status" text DEFAULT 'PENDING',
	"underpaid_amount" numeric(36, 18),
	"overpaid_amount" numeric(36, 18),
	"refund_processed_at" timestamp(3),
	"top_up_allowed" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sandbox_webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"url" text NOT NULL,
	"events" text[],
	"secret" text NOT NULL,
	"status" "WebhookStatus" DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"business_id" text NOT NULL,
	"type" "SettlementAccountType" NOT NULL,
	"account_name" text NOT NULL,
	"account_number" text,
	"bank_code" text,
	"bank_name" text,
	"phone_number" text,
	"mobile_network_code" text,
	"mobile_network_name" text,
	"currency" text NOT NULL,
	"country" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"flutterwave_recipient_id" integer,
	"verification_data" jsonb,
	"metadata" jsonb,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"verified_at" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "settlement_payouts" (
	"id" text PRIMARY KEY NOT NULL,
	"settlement_id" text NOT NULL,
	"settlement_account_id" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"fees" numeric(18, 2) DEFAULT '0' NOT NULL,
	"net_amount" numeric(18, 2) NOT NULL,
	"status" "SettlementPayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"flutterwave_transfer_id" integer,
	"flutterwave_reference" text,
	"provider_response" jsonb,
	"admin_approved_by" text,
	"admin_approved_at" timestamp(3),
	"admin_notes" text,
	"processed_at" timestamp(3),
	"completed_at" timestamp(3),
	"failed_at" timestamp(3),
	"failure_reason" text,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"amount_after_vat" numeric(18, 2),
	"vat_amount" numeric(18, 2),
	"vat_rate" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"bankAccount" text NOT NULL,
	"bankName" text NOT NULL,
	"bankCode" text,
	"accountName" text,
	"status" "SettlementStatus" DEFAULT 'PENDING' NOT NULL,
	"transactionCount" integer DEFAULT 0 NOT NULL,
	"fees" numeric(18, 2) DEFAULT '0' NOT NULL,
	"requestedAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"processedAt" timestamp(3),
	"completedAt" timestamp(3),
	"failureReason" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"payout_method" text DEFAULT 'BANK_TRANSFER',
	"requires_admin_approval" boolean DEFAULT true NOT NULL,
	"settlement_account_id" text
);
--> statement-breakpoint
CREATE TABLE "smile_id_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"jobId" text NOT NULL,
	"userId" text NOT NULL,
	"businessId" text NOT NULL,
	"smileUserId" text NOT NULL,
	"product" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"token" text,
	"expiresAt" timestamp(3),
	"result" jsonb,
	"verifiedAt" timestamp(3),
	"resultCode" text,
	"confidenceValue" double precision,
	"idInfo" jsonb,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supported_currencies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"country" text NOT NULL,
	"symbol" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updatedBy" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "TeamRole" DEFAULT 'MEMBER' NOT NULL,
	"status" "TeamMemberStatus" DEFAULT 'PENDING' NOT NULL,
	"invitedBy" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"customerName" text,
	"customerEmail" text,
	"walletAddress" text,
	"amount" numeric(18, 8),
	"cryptoAmount" numeric(18, 8),
	"currency" text,
	"cryptoCurrency" text,
	"status" "TransactionStatus" DEFAULT 'PENDING' NOT NULL,
	"payoutStatus" "PayoutStatus" DEFAULT 'PENDING' NOT NULL,
	"transactionHash" text,
	"blockConfirmations" integer DEFAULT 0,
	"fees" numeric(18, 8),
	"exchangeRate" numeric(18, 8),
	"invoiceId" text,
	"paymentLinkId" text,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"accountName" text,
	"accountNumber" text,
	"actualAmount" numeric(18, 8),
	"addressSource" text,
	"bankCode" text,
	"callbackUrl" text,
	"depositAddress" text,
	"description" text,
	"estimatedUsdtAmount" numeric(18, 8),
	"expectedAmount" numeric(18, 8),
	"expiresAt" timestamp(3),
	"externalId" text,
	"fromAmount" numeric(18, 8),
	"fromCurrency" text,
	"fromNetwork" text,
	"isMobileMoney" boolean DEFAULT false,
	"notes" text,
	"paymentTolerance" numeric(5, 4) DEFAULT '0.01',
	"redirectUrl" text,
	"reference" text,
	"refundAddress" text,
	"refundAmount" numeric(18, 8),
	"refundTxHash" text,
	"toAmount" numeric(18, 8),
	"toCurrency" text,
	"toNetwork" text,
	"txHash" text,
	"type" text DEFAULT 'crypto',
	"walletReferenceId" text,
	"checkoutSessionId" text,
	"gateioOrderId" text,
	"usdValue" numeric(18, 2),
	"usdtAmount" numeric(18, 8),
	"riskFlags" jsonb,
	"riskLevel" text DEFAULT 'LOW',
	"riskScore" integer DEFAULT 0,
	"depositTxHash" text,
	"settlementId" text,
	"payment_status" text DEFAULT 'PENDING',
	"underpaid_amount" numeric(36, 18),
	"overpaid_amount" numeric(36, 18),
	"refund_processed_at" timestamp(3),
	"top_up_allowed" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "TransferFee" (
	"id" serial PRIMARY KEY NOT NULL,
	"currency" text NOT NULL,
	"paymentMethod" text NOT NULL,
	"minAmount" double precision NOT NULL,
	"maxAmount" double precision NOT NULL,
	"fee" double precision NOT NULL,
	"feeType" text DEFAULT 'fixed' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"deletedAt" timestamp(3),
	"governmentIdDoc" text,
	"role" text,
	"selfieDoc" text,
	"lastLoginAt" timestamp(3),
	"emailVerificationSentAt" timestamp(3),
	"emailVerificationToken" text,
	"emailVerificationTokenExpires" timestamp(3),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"twoFactorBackupCodes" text[] DEFAULT '{"RAY"}',
	"twoFactorEnabled" boolean DEFAULT false NOT NULL,
	"twoFactorSecret" text,
	"phone" text,
	"resetToken" text,
	"resetTokenExpiry" timestamp(3)
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"referenceId" text NOT NULL,
	"address" text NOT NULL,
	"blockchain" text NOT NULL,
	"network" text NOT NULL,
	"encryptedPrivateKey" text NOT NULL,
	"businessId" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_idempotency" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"webhook_id" text NOT NULL,
	"business_id" text NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload_hash" text NOT NULL,
	"processed_at" timestamp(3) DEFAULT NOW() NOT NULL,
	"result" jsonb
);
--> statement-breakpoint
CREATE TABLE "webhook_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"webhookId" text,
	"businessId" text NOT NULL,
	"transactionId" text,
	"eventType" text NOT NULL,
	"event" text,
	"url" text NOT NULL,
	"payload" jsonb NOT NULL,
	"response" jsonb,
	"success" boolean NOT NULL,
	"statusCode" integer,
	"error" text,
	"timestamp" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"url" text NOT NULL,
	"events" text[],
	"secret" text NOT NULL,
	"status" "WebhookStatus" DEFAULT 'ACTIVE' NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "whitelisted_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"businessId" text NOT NULL,
	"domain" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"verificationToken" text NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verifiedAt" timestamp(3)
);
--> statement-breakpoint
ALTER TABLE "admin_activity_logs" ADD CONSTRAINT "admin_activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "public"."custom_roles"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "business_documents" ADD CONSTRAINT "business_documents_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD CONSTRAINT "checkout_sessions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "gas_funding" ADD CONSTRAINT "gas_funding_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "fk_idempotency_keys_business" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_checkout_sessions" ADD CONSTRAINT "sandbox_checkout_sessions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_invoice_items" ADD CONSTRAINT "sandbox_invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."sandbox_invoices"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_invoices" ADD CONSTRAINT "sandbox_invoices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_payment_links" ADD CONSTRAINT "sandbox_payment_links_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_settlements" ADD CONSTRAINT "sandbox_settlements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD CONSTRAINT "sandbox_transactions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD CONSTRAINT "sandbox_transactions_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "public"."sandbox_checkout_sessions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD CONSTRAINT "sandbox_transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."sandbox_invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_transactions" ADD CONSTRAINT "sandbox_transactions_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "public"."sandbox_payment_links"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sandbox_webhooks" ADD CONSTRAINT "sandbox_webhooks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "settlement_accounts" ADD CONSTRAINT "settlement_accounts_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "settlement_payouts" ADD CONSTRAINT "settlement_payouts_settlement_account_id_fkey" FOREIGN KEY ("settlement_account_id") REFERENCES "public"."settlement_accounts"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "settlement_payouts" ADD CONSTRAINT "settlement_payouts_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "public"."settlements"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_settlement_account_id_fkey" FOREIGN KEY ("settlement_account_id") REFERENCES "public"."settlement_accounts"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "smile_id_verifications" ADD CONSTRAINT "smile_id_verifications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "smile_id_verifications" ADD CONSTRAINT "smile_id_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_checkoutSessionId_fkey" FOREIGN KEY ("checkoutSessionId") REFERENCES "public"."checkout_sessions"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paymentLinkId_fkey" FOREIGN KEY ("paymentLinkId") REFERENCES "public"."payment_links"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "public"."settlements"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhook_idempotency" ADD CONSTRAINT "fk_webhook_idempotency_webhook" FOREIGN KEY ("webhook_id") REFERENCES "public"."webhooks"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhook_idempotency" ADD CONSTRAINT "fk_webhook_idempotency_business" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "whitelisted_domains" ADD CONSTRAINT "whitelisted_domains_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "admin_activity_logs_action_idx" ON "admin_activity_logs" USING btree ("action" text_ops);--> statement-breakpoint
CREATE INDEX "admin_activity_logs_adminId_idx" ON "admin_activity_logs" USING btree ("adminId" text_ops);--> statement-breakpoint
CREATE INDEX "admin_activity_logs_createdAt_idx" ON "admin_activity_logs" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "admin_notifications_adminId_idx" ON "admin_notifications" USING btree ("adminId" text_ops);--> statement-breakpoint
CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "admin_notifications_isRead_idx" ON "admin_notifications" USING btree ("isRead" bool_ops);--> statement-breakpoint
CREATE INDEX "admin_notifications_type_idx" ON "admin_notifications" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "admins_email_key" ON "admins" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "admins_onboardingToken_idx" ON "admins" USING btree ("onboardingToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "admins_onboardingToken_key" ON "admins" USING btree ("onboardingToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys" USING btree ("keyHash" text_ops);--> statement-breakpoint
CREATE INDEX "checkout_sessions_businessId_idx" ON "checkout_sessions" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "checkout_sessions_status_idx" ON "checkout_sessions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_sessions_status_armed_at" ON "checkout_sessions" USING btree ("status" enum_ops,"armed_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_sessions_deposit_address" ON "checkout_sessions" USING btree ("deposit_address" text_ops);--> statement-breakpoint
CREATE INDEX "idx_checkout_sessions_refund_address" ON "checkout_sessions" USING btree ("refund_address" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_checkout_sessions_active_transaction_unique" ON "checkout_sessions" USING btree ("active_transaction_id" text_ops) WHERE "checkout_sessions"."active_transaction_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "currencies_network_idx" ON "currencies" USING btree ("network" text_ops);--> statement-breakpoint
CREATE INDEX "currencies_ticker_idx" ON "currencies" USING btree ("ticker" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "currencies_ticker_network_key" ON "currencies" USING btree ("ticker" text_ops,"network" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "currency_aggregates_currency_key" ON "currency_aggregates" USING btree ("currency" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "custom_roles_name_key" ON "custom_roles" USING btree ("name" text_ops);--> statement-breakpoint
CREATE INDEX "dkim_keys_domain_isActive_idx" ON "dkim_keys" USING btree ("domain" text_ops,"isActive" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "dkim_keys_domain_selector_key" ON "dkim_keys" USING btree ("domain" text_ops,"selector" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "exchange_rates_baseCurrency_targetCurrency_fetchedAt_key" ON "exchange_rates" USING btree ("baseCurrency","targetCurrency","fetchedAt");--> statement-breakpoint
CREATE INDEX "exchange_rates_baseCurrency_targetCurrency_idx" ON "exchange_rates" USING btree ("baseCurrency","targetCurrency");--> statement-breakpoint
CREATE INDEX "exchange_rates_validUntil_idx" ON "exchange_rates" USING btree ("validUntil");--> statement-breakpoint
CREATE UNIQUE INDEX "flutterwave_banks_bank_id_country_key" ON "flutterwave_banks" USING btree ("bank_id" int4_ops,"country" text_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_banks_code_idx" ON "flutterwave_banks" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_banks_country_currency_idx" ON "flutterwave_banks" USING btree ("country" text_ops,"currency" text_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_banks_is_active_idx" ON "flutterwave_banks" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_mobile_networks_country_idx" ON "flutterwave_mobile_networks" USING btree ("country" text_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_mobile_networks_is_active_idx" ON "flutterwave_mobile_networks" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "flutterwave_mobile_networks_network_code_country_key" ON "flutterwave_mobile_networks" USING btree ("network_code" text_ops,"country" text_ops);--> statement-breakpoint
CREATE INDEX "flutterwave_mobile_networks_network_code_idx" ON "flutterwave_mobile_networks" USING btree ("network_code" text_ops);--> statement-breakpoint
CREATE INDEX "idx_fund_sweep_logs_timestamp" ON "fund_sweep_logs" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_fund_sweep_logs_created_at" ON "fund_sweep_logs" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "gas_funding_businessId_idx" ON "gas_funding" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "gas_funding_createdAt_idx" ON "gas_funding" USING btree ("createdAt" timestamp_ops);--> statement-breakpoint
CREATE INDEX "gas_funding_network_idx" ON "gas_funding" USING btree ("network" text_ops);--> statement-breakpoint
CREATE INDEX "gas_funding_status_idx" ON "gas_funding" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "gas_funding_walletAddress_idx" ON "gas_funding" USING btree ("walletAddress" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "generated_wallets_address_key" ON "generated_wallets" USING btree ("address" text_ops);--> statement-breakpoint
CREATE INDEX "generated_wallets_blockchain_network_idx" ON "generated_wallets" USING btree ("blockchain" text_ops,"network" text_ops);--> statement-breakpoint
CREATE INDEX "generated_wallets_businessId_idx" ON "generated_wallets" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "generated_wallets_isActive_idx" ON "generated_wallets" USING btree ("isActive" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "generated_wallets_referenceId_key" ON "generated_wallets" USING btree ("referenceId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_idempotency_keys_unique" ON "idempotency_keys" USING btree ("business_id" text_ops,"idempotency_key" text_ops,"endpoint" text_ops);--> statement-breakpoint
CREATE INDEX "idx_idempotency_keys_expires_at" ON "idempotency_keys" USING btree ("expires_at" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices" USING btree ("invoiceNumber" text_ops);--> statement-breakpoint
CREATE INDEX "notifications_businessId_idx" ON "notifications" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "notifications_userId_idx" ON "notifications" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "payment_fiat_rates_currency_idx" ON "payment_fiat_rates" USING btree ("currency" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_fiat_rates_currency_key" ON "payment_fiat_rates" USING btree ("currency" text_ops);--> statement-breakpoint
CREATE INDEX "payment_fiat_rates_source_idx" ON "payment_fiat_rates" USING btree ("source" text_ops);--> statement-breakpoint
CREATE INDEX "payment_fiat_rates_updatedAt_idx" ON "payment_fiat_rates" USING btree ("updatedAt" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_links_slug_key" ON "payment_links" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pending_sweeps_status" ON "pending_sweeps" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_pending_sweeps_network_currency" ON "pending_sweeps" USING btree ("network" text_ops,"currency" text_ops);--> statement-breakpoint
CREATE INDEX "idx_pending_sweeps_created_at" ON "pending_sweeps" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_pending_sweeps_next_retry" ON "pending_sweeps" USING btree ("next_retry_at" timestamp_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "pending_sweeps_transaction_id_key" ON "pending_sweeps" USING btree ("transaction_id" text_ops);--> statement-breakpoint
CREATE INDEX "processed_transactions_processType_idx" ON "processed_transactions" USING btree ("processType" text_ops);--> statement-breakpoint
CREATE INDEX "processed_transactions_transactionId_idx" ON "processed_transactions" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "processed_transactions_transactionId_key" ON "processed_transactions" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_checkout_sessions_businessId_idx" ON "sandbox_checkout_sessions" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "sandbox_checkout_sessions_status_idx" ON "sandbox_checkout_sessions" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_checkout_sessions_status_armed_at" ON "sandbox_checkout_sessions" USING btree ("status" enum_ops,"armed_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_checkout_sessions_deposit_address" ON "sandbox_checkout_sessions" USING btree ("deposit_address" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_checkout_sessions_refund_address" ON "sandbox_checkout_sessions" USING btree ("refund_address" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_sandbox_checkout_sessions_active_transaction_unique" ON "sandbox_checkout_sessions" USING btree ("active_transaction_id" text_ops) WHERE "sandbox_checkout_sessions"."active_transaction_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_invoices_invoiceNumber_key" ON "sandbox_invoices" USING btree ("invoiceNumber" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sandbox_payment_links_slug_key" ON "sandbox_payment_links" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_transactions_payment_status" ON "sandbox_transactions" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_transactions_checkout_session_status" ON "sandbox_transactions" USING btree ("checkoutSessionId" text_ops,"status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_sandbox_transactions_refund_processed" ON "sandbox_transactions" USING btree ("refund_processed_at" timestamp_ops) WHERE "sandbox_transactions"."refund_processed_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "settlement_accounts_business_id_idx" ON "settlement_accounts" USING btree ("business_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "settlement_accounts_business_primary_unique" ON "settlement_accounts" USING btree ("business_id" text_ops,"is_primary" bool_ops);--> statement-breakpoint
CREATE INDEX "settlement_accounts_currency_idx" ON "settlement_accounts" USING btree ("currency" text_ops);--> statement-breakpoint
CREATE INDEX "settlement_accounts_is_active_idx" ON "settlement_accounts" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "settlement_accounts_is_primary_idx" ON "settlement_accounts" USING btree ("is_primary" bool_ops);--> statement-breakpoint
CREATE INDEX "settlement_accounts_type_idx" ON "settlement_accounts" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "settlement_payouts_created_at_idx" ON "settlement_payouts" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "settlement_payouts_flutterwave_transfer_id_idx" ON "settlement_payouts" USING btree ("flutterwave_transfer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "settlement_payouts_settlement_id_idx" ON "settlement_payouts" USING btree ("settlement_id" text_ops);--> statement-breakpoint
CREATE INDEX "settlement_payouts_status_idx" ON "settlement_payouts" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "smile_id_verifications_businessId_idx" ON "smile_id_verifications" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "smile_id_verifications_jobId_idx" ON "smile_id_verifications" USING btree ("jobId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "smile_id_verifications_jobId_key" ON "smile_id_verifications" USING btree ("jobId" text_ops);--> statement-breakpoint
CREATE INDEX "smile_id_verifications_status_idx" ON "smile_id_verifications" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "smile_id_verifications_userId_idx" ON "smile_id_verifications" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "supported_currencies_code_key" ON "supported_currencies" USING btree ("code" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_category_key_key" ON "system_settings" USING btree ("category" text_ops,"key" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_businessId_userId_key" ON "team_members" USING btree ("businessId" text_ops,"userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_payment_status" ON "transactions" USING btree ("payment_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_checkout_session_status" ON "transactions" USING btree ("checkoutSessionId" text_ops,"status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_transactions_refund_processed" ON "transactions" USING btree ("refund_processed_at" timestamp_ops) WHERE "transactions"."refund_processed_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "TransferFee_currency_paymentMethod_idx" ON "TransferFee" USING btree ("currency","paymentMethod");--> statement-breakpoint
CREATE UNIQUE INDEX "TransferFee_currency_paymentMethod_minAmount_maxAmount_key" ON "TransferFee" USING btree ("currency","paymentMethod","minAmount","maxAmount");--> statement-breakpoint
CREATE INDEX "users_emailVerificationToken_idx" ON "users" USING btree ("emailVerificationToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users" USING btree ("emailVerificationToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "users_resetToken_idx" ON "users" USING btree ("resetToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_resetToken_key" ON "users" USING btree ("resetToken" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets" USING btree ("address" text_ops);--> statement-breakpoint
CREATE INDEX "wallets_blockchain_network_idx" ON "wallets" USING btree ("blockchain" text_ops,"network" text_ops);--> statement-breakpoint
CREATE INDEX "wallets_businessId_idx" ON "wallets" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "wallets_isActive_idx" ON "wallets" USING btree ("isActive" bool_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_referenceId_key" ON "wallets" USING btree ("referenceId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_webhook_idempotency_unique" ON "webhook_idempotency" USING btree ("webhook_id" text_ops,"event_id" text_ops,"event_type" text_ops);--> statement-breakpoint
CREATE INDEX "idx_webhook_idempotency_business_event" ON "webhook_idempotency" USING btree ("business_id" text_ops,"event_type" text_ops);--> statement-breakpoint
CREATE INDEX "webhook_logs_businessId_idx" ON "webhook_logs" USING btree ("businessId" text_ops);--> statement-breakpoint
CREATE INDEX "webhook_logs_eventType_idx" ON "webhook_logs" USING btree ("eventType" text_ops);--> statement-breakpoint
CREATE INDEX "webhook_logs_timestamp_idx" ON "webhook_logs" USING btree ("timestamp" timestamp_ops);--> statement-breakpoint
CREATE INDEX "webhook_logs_transactionId_idx" ON "webhook_logs" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE INDEX "webhook_logs_webhookId_idx" ON "webhook_logs" USING btree ("webhookId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "whitelisted_domains_businessId_domain_key" ON "whitelisted_domains" USING btree ("businessId" text_ops,"domain" text_ops);