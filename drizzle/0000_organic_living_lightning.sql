CREATE TYPE "public"."auction_status" AS ENUM('open', 'closed', 'settling', 'awarded', 'no_bid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."battle_status" AS ENUM('scheduled', 'live', 'ended', 'validating', 'finalized', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."bid_status" AS ENUM('valid', 'outbid', 'winning', 'payment_failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fraud_status" AS ENUM('pending', 'valid', 'invalid', 'review');--> statement-breakpoint
CREATE TYPE "public"."launch_status" AS ENUM('live', 'beta', 'waitlist');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('not_required', 'pending', 'authorized', 'captured', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."startup_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('voter', 'founder', 'admin');--> statement-breakpoint
CREATE TABLE "auctions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"opens_at" timestamp with time zone NOT NULL,
	"closes_at" timestamp with time zone NOT NULL,
	"status" "auction_status" DEFAULT 'open' NOT NULL,
	"minimum_bid_cents" integer DEFAULT 500 NOT NULL,
	"minimum_increment_cents" integer DEFAULT 100 NOT NULL,
	"winning_bid_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"champion_startup_id" uuid NOT NULL,
	"challenger_startup_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "battle_status" DEFAULT 'scheduled' NOT NULL,
	"winner_startup_id" uuid,
	"champion_votes" integer DEFAULT 0 NOT NULL,
	"challenger_votes" integer DEFAULT 0 NOT NULL,
	"champion_streak_at_start" integer DEFAULT 0 NOT NULL,
	"finalized_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auction_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"status" "bid_status" DEFAULT 'valid' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'authorized' NOT NULL,
	"payment_reference" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" text NOT NULL,
	"battle_id" uuid,
	"startup_id" uuid,
	"user_id" uuid,
	"session_hash" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "startups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"url" text NOT NULL,
	"tagline" text NOT NULL,
	"logo_url" text,
	"screenshot_url" text,
	"demo_url" text,
	"founder_social_url" text,
	"launch_status" "launch_status" DEFAULT 'live' NOT NULL,
	"status" "startup_status" DEFAULT 'pending' NOT NULL,
	"safety_confirmed" boolean DEFAULT false NOT NULL,
	"approved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'voter' NOT NULL,
	"email_verified_at" timestamp with time zone,
	"stripe_customer_id" text,
	"stripe_payment_method_id" text,
	"payment_method_verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"battle_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"startup_id" uuid NOT NULL,
	"ip_hash" text NOT NULL,
	"user_agent_hash" text,
	"fraud_status" "fraud_status" DEFAULT 'valid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_champion_startup_id_startups_id_fk" FOREIGN KEY ("champion_startup_id") REFERENCES "public"."startups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_challenger_startup_id_startups_id_fk" FOREIGN KEY ("challenger_startup_id") REFERENCES "public"."startups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battles" ADD CONSTRAINT "battles_winner_startup_id_startups_id_fk" FOREIGN KEY ("winner_startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_auction_id_auctions_id_fk" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "startups" ADD CONSTRAINT "startups_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_battle_id_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."battles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_startup_id_startups_id_fk" FOREIGN KEY ("startup_id") REFERENCES "public"."startups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auctions_battle_unique" ON "auctions" USING btree ("battle_id");--> statement-breakpoint
CREATE INDEX "auctions_status_close_idx" ON "auctions" USING btree ("status","closes_at");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "battles_status_idx" ON "battles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "battles_starts_idx" ON "battles" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "battles_champion_idx" ON "battles" USING btree ("champion_startup_id");--> statement-breakpoint
CREATE INDEX "battles_challenger_idx" ON "battles" USING btree ("challenger_startup_id");--> statement-breakpoint
CREATE INDEX "bids_auction_amount_idx" ON "bids" USING btree ("auction_id","amount_cents");--> statement-breakpoint
CREATE INDEX "bids_user_idx" ON "bids" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bids_startup_idx" ON "bids" USING btree ("startup_id");--> statement-breakpoint
CREATE INDEX "events_battle_type_idx" ON "events" USING btree ("battle_id","event_type");--> statement-breakpoint
CREATE INDEX "events_startup_type_idx" ON "events" USING btree ("startup_id","event_type");--> statement-breakpoint
CREATE INDEX "events_created_idx" ON "events" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "magic_links_token_hash_unique" ON "magic_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "magic_links_email_idx" ON "magic_links" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiry_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "startups_slug_unique" ON "startups" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "startups_url_unique" ON "startups" USING btree ("url");--> statement-breakpoint
CREATE INDEX "startups_owner_idx" ON "startups" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "startups_status_idx" ON "startups" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_battle_user_unique" ON "votes" USING btree ("battle_id","user_id");--> statement-breakpoint
CREATE INDEX "votes_battle_startup_idx" ON "votes" USING btree ("battle_id","startup_id");--> statement-breakpoint
CREATE INDEX "votes_ip_idx" ON "votes" USING btree ("ip_hash");