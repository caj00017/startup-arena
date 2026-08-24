ALTER TABLE "magic_links" ADD COLUMN "browser_token_hash" text;--> statement-breakpoint
ALTER TABLE "magic_links" ADD COLUMN "next_path" text DEFAULT '/' NOT NULL;--> statement-breakpoint
ALTER TABLE "magic_links" ADD COLUMN "claimed_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "magic_links_browser_token_hash_unique" ON "magic_links" USING btree ("browser_token_hash");