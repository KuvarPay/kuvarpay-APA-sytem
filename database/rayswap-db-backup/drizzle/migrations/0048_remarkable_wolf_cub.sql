CREATE TYPE "public"."BlogStatus" AS ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image" text,
	"author_id" text NOT NULL,
	"status" "BlogStatus" DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp(3),
	"created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp(3) NOT NULL,
	"locked_by" text,
	"locked_at" timestamp(3),
	"tags" text[]
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_lockedBy_fkey" FOREIGN KEY ("locked_by") REFERENCES "public"."admins"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "blog_posts_author_id_idx" ON "blog_posts" USING btree ("author_id" text_ops);--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status" enum_ops);