import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["voter", "founder", "admin"]);
export const startupStatus = pgEnum("startup_status", [
  "pending",
  "approved",
  "rejected",
  "suspended"
]);
export const battleStatus = pgEnum("battle_status", [
  "scheduled",
  "live",
  "paused",
  "ended",
  "validating",
  "finalized",
  "cancelled"
]);
export const auctionStatus = pgEnum("auction_status", [
  "open",
  "paused",
  "closed",
  "settling",
  "awarded",
  "no_bid",
  "cancelled"
]);
export const bidStatus = pgEnum("bid_status", [
  "valid",
  "outbid",
  "winning",
  "payment_failed",
  "cancelled"
]);
export const fraudStatus = pgEnum("fraud_status", [
  "pending",
  "valid",
  "invalid",
  "review"
]);
export const paymentStatus = pgEnum("payment_status", [
  "not_required",
  "pending",
  "authorized",
  "captured",
  "failed",
  "refunded"
]);
export const launchStatus = pgEnum("launch_status", ["live", "beta", "waitlist"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    role: userRole("role").notNull().default("voter"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    stripeCustomerId: text("stripe_customer_id"),
    stripePaymentMethodId: text("stripe_payment_method_id"),
    paymentMethodVerifiedAt: timestamp("payment_method_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_idx").on(table.userId),
    index("sessions_expiry_idx").on(table.expiresAt)
  ]
);

export const magicLinks = pgTable(
  "magic_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("magic_links_token_hash_unique").on(table.tokenHash),
    index("magic_links_email_idx").on(table.email)
  ]
);

export const startups = pgTable(
  "startups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    url: text("url").notNull(),
    tagline: text("tagline").notNull(),
    logoUrl: text("logo_url"),
    screenshotUrl: text("screenshot_url"),
    demoUrl: text("demo_url"),
    founderSocialUrl: text("founder_social_url"),
    launchStatus: launchStatus("launch_status").notNull().default("live"),
    status: startupStatus("status").notNull().default("pending"),
    safetyConfirmed: boolean("safety_confirmed").notNull().default(false),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("startups_slug_unique").on(table.slug),
    uniqueIndex("startups_url_unique").on(table.url),
    index("startups_owner_idx").on(table.ownerId),
    index("startups_status_idx").on(table.status)
  ]
);

export const battles = pgTable(
  "battles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    previousBattleId: uuid("previous_battle_id"),
    championStartupId: uuid("champion_startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "restrict" }),
    challengerStartupId: uuid("challenger_startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    status: battleStatus("status").notNull().default("scheduled"),
    winnerStartupId: uuid("winner_startup_id").references(() => startups.id, {
      onDelete: "set null"
    }),
    championVotes: integer("champion_votes").notNull().default(0),
    challengerVotes: integer("challenger_votes").notNull().default(0),
    championStreakAtStart: integer("champion_streak_at_start").notNull().default(0),
    finalizedAt: timestamp("finalized_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("battles_previous_unique").on(table.previousBattleId),
    index("battles_status_idx").on(table.status),
    index("battles_starts_idx").on(table.startsAt),
    index("battles_champion_idx").on(table.championStartupId),
    index("battles_challenger_idx").on(table.challengerStartupId)
  ]
);

export const auctions = pgTable(
  "auctions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    opensAt: timestamp("opens_at", { withTimezone: true }).notNull(),
    closesAt: timestamp("closes_at", { withTimezone: true }).notNull(),
    status: auctionStatus("status").notNull().default("open"),
    minimumBidCents: integer("minimum_bid_cents").notNull().default(500),
    minimumIncrementCents: integer("minimum_increment_cents").notNull().default(100),
    winningBidId: uuid("winning_bid_id"),
    wildcardStartupId: uuid("wildcard_startup_id").references(() => startups.id, {
      onDelete: "set null"
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("auctions_battle_unique").on(table.battleId),
    index("auctions_status_close_idx").on(table.status, table.closesAt)
  ]
);

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    status: bidStatus("status").notNull().default("valid"),
    paymentStatus: paymentStatus("payment_status").notNull().default("authorized"),
    paymentReference: text("payment_reference"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("bids_auction_amount_idx").on(table.auctionId, table.amountCents),
    index("bids_user_idx").on(table.userId),
    index("bids_startup_idx").on(table.startupId)
  ]
);

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    battleId: uuid("battle_id")
      .notNull()
      .references(() => battles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "restrict" }),
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash"),
    fraudStatus: fraudStatus("fraud_status").notNull().default("valid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("votes_battle_user_unique").on(table.battleId, table.userId),
    index("votes_battle_startup_idx").on(table.battleId, table.startupId),
    index("votes_ip_idx").on(table.ipHash)
  ]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    battleId: uuid("battle_id").references(() => battles.id, { onDelete: "set null" }),
    startupId: uuid("startup_id").references(() => startups.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionHash: text("session_hash"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    index("events_battle_type_idx").on(table.battleId, table.eventType),
    index("events_startup_type_idx").on(table.startupId, table.eventType),
    index("events_created_idx").on(table.createdAt)
  ]
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("audit_entity_idx").on(table.entityType, table.entityId)]
);

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Startup = typeof startups.$inferSelect;
export type Battle = typeof battles.$inferSelect;
export type Auction = typeof auctions.$inferSelect;
export type Bid = typeof bids.$inferSelect;
export type Vote = typeof votes.$inferSelect;
