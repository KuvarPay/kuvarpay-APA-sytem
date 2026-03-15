CREATE TABLE "kuvar_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"token_hash" text NOT NULL,
	"consent_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "kuvar_identities_token_hash_key" ON "kuvar_identities" USING btree ("token_hash" text_ops);--> statement-breakpoint
CREATE INDEX "kuvar_identities_email_idx" ON "kuvar_identities" USING btree ("email" text_ops);