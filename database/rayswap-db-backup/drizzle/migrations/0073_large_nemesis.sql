CREATE TABLE "agent_achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"achievement_type" text NOT NULL,
	"unlocked_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "agent_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"level" text DEFAULT 'BRONZE' NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_progress_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"agent_id" text NOT NULL,
	"total_volume_usd" numeric(18, 2) DEFAULT '0' NOT NULL,
	"total_rewards_ngn" numeric(18, 2) DEFAULT '0' NOT NULL,
	"active_merchants_count" integer DEFAULT 0 NOT NULL,
	"snapshot_date" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_achievements" ADD CONSTRAINT "agent_achievements_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_levels" ADD CONSTRAINT "agent_levels_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_progress_snapshots" ADD CONSTRAINT "agent_progress_snapshots_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "agent_achievements_agent_id_idx" ON "agent_achievements" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agent_achievements_agent_type_key" ON "agent_achievements" USING btree ("agent_id" text_ops,"achievement_type" text_ops);--> statement-breakpoint
CREATE INDEX "agent_levels_agent_id_idx" ON "agent_levels" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "agent_levels_agent_id_key" ON "agent_levels" USING btree ("agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "agent_progress_snapshots_agent_id_idx" ON "agent_progress_snapshots" USING btree ("agent_id" text_ops);