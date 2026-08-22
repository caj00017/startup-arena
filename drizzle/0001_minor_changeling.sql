ALTER TABLE "auctions" ADD COLUMN "wildcard_startup_id" uuid;--> statement-breakpoint
ALTER TABLE "battles" ADD COLUMN "previous_battle_id" uuid;--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_wildcard_startup_id_startups_id_fk" FOREIGN KEY ("wildcard_startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "battles_previous_unique" ON "battles" USING btree ("previous_battle_id");