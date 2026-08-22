import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auctions, battles, bids, startups, users, votes } from "@/db/schema";
import { placeBid } from "@/services/auction";
import { createInitialBattle, setAuctionPaused, setBattlePaused } from "@/services/admin";
import { ensureNextBattle, finalizeBattle, settleAuction } from "@/services/rollover";
import { castVote } from "@/services/voting";

const ids = {
  championOwner: "01000000-0000-4000-8000-000000000001",
  challengerOwner: "01000000-0000-4000-8000-000000000002",
  bidderOwner: "01000000-0000-4000-8000-000000000003",
  fallbackOwner: "01000000-0000-4000-8000-000000000004",
  voter: "01000000-0000-4000-8000-000000000005",
  champion: "02000000-0000-4000-8000-000000000001",
  challenger: "02000000-0000-4000-8000-000000000002",
  bidder: "02000000-0000-4000-8000-000000000003",
  fallback: "02000000-0000-4000-8000-000000000004",
  battle: "03000000-0000-4000-8000-000000000001",
  auction: "04000000-0000-4000-8000-000000000001"
};

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
});

beforeEach(async () => {
  await db.execute(sql`truncate table webhook_events, audit_logs, events, votes, bids, auctions, battles, startups, magic_links, sessions, users cascade`);
  const now = new Date();
  await db.insert(users).values([
    { id: ids.championOwner, email: "champion@example.com", role: "founder", emailVerifiedAt: now },
    { id: ids.challengerOwner, email: "challenger@example.com", role: "founder", emailVerifiedAt: now },
    { id: ids.bidderOwner, email: "bidder@example.com", role: "founder", emailVerifiedAt: now, stripePaymentMethodId: "pm_mock", paymentMethodVerifiedAt: now },
    { id: ids.fallbackOwner, email: "fallback@example.com", role: "founder", emailVerifiedAt: now },
    { id: ids.voter, email: "voter@example.com", role: "voter", emailVerifiedAt: now }
  ]);
  await db.insert(startups).values([
    { id: ids.champion, ownerId: ids.championOwner, name: "Champion", slug: "champion", url: "https://example.com/champion", tagline: "The current arena champion product.", status: "approved", safetyConfirmed: true, approvedAt: now },
    { id: ids.challenger, ownerId: ids.challengerOwner, name: "Challenger", slug: "challenger", url: "https://example.com/challenger", tagline: "The startup challenging the title.", status: "approved", safetyConfirmed: true, approvedAt: now },
    { id: ids.bidder, ownerId: ids.bidderOwner, name: "Bidder", slug: "bidder", url: "https://example.com/bidder", tagline: "The startup bidding for tomorrow.", status: "approved", safetyConfirmed: true, approvedAt: now },
    { id: ids.fallback, ownerId: ids.fallbackOwner, name: "Fallback", slug: "fallback", url: "https://example.com/fallback", tagline: "The fallback startup for empty auctions.", status: "approved", safetyConfirmed: true, approvedAt: now }
  ]);
  await db.insert(battles).values({ id: ids.battle, championStartupId: ids.champion, challengerStartupId: ids.challenger, startsAt: new Date(now.getTime() - 86_400_000), endsAt: new Date(now.getTime() + 60_000), status: "live", championStreakAtStart: 2 });
  await db.insert(auctions).values({ id: ids.auction, battleId: ids.battle, opensAt: new Date(now.getTime() - 86_400_000), closesAt: new Date(now.getTime() + 30_000), status: "open", wildcardStartupId: ids.fallback });
});

describe("core v0.1 workflow", () => {
  it("records one verified vote and rejects a duplicate", async () => {
    await castVote({ battleId: ids.battle, startupId: ids.challenger, userId: ids.voter, ipHash: "ip-one", userAgentHash: "agent-one" });
    await expect(castVote({ battleId: ids.battle, startupId: ids.champion, userId: ids.voter, ipHash: "ip-one", userAgentHash: "agent-one" })).rejects.toThrow("already voted");
    expect(await db.select().from(votes)).toHaveLength(1);
  });

  it("accepts an eligible founder bid and captures the winner in mock mode", async () => {
    const bid = await placeBid({ auctionId: ids.auction, startupId: ids.bidder, userId: ids.bidderOwner, amountCents: 500 });
    expect(bid.amountCents).toBe(500);
    const settled = await settleAuction(ids.auction, new Date(Date.now() + 60_000));
    expect(settled.status).toBe("awarded");
    const [winningBid] = await db.select().from(bids).where(eq(bids.id, bid.id));
    expect(winningBid.paymentStatus).toBe("captured");
  });

  it("finalizes a tie for the champion and schedules the wildcard challenger", async () => {
    await db.update(auctions).set({ closesAt: new Date(Date.now() - 1_000) }).where(eq(auctions.id, ids.auction));
    await db.update(battles).set({ endsAt: new Date(Date.now() - 1_000) }).where(eq(battles.id, ids.battle));
    const settled = await settleAuction(ids.auction);
    expect(settled.status).toBe("no_bid");
    const finalized = await finalizeBattle(ids.battle);
    expect(finalized.winnerStartupId).toBe(ids.champion);
    const next = await ensureNextBattle(ids.battle);
    expect(next.created).toBe(true);
    expect(next.battle?.championStartupId).toBe(ids.champion);
    expect(next.battle?.challengerStartupId).toBe(ids.fallback);
    expect(next.battle?.championStreakAtStart).toBe(3);
  });

  it("creates and safely pauses the initial production cycle", async () => {
    await db.delete(auctions);
    await db.delete(battles);
    const initial = await createInitialBattle({
      championStartupId: ids.champion,
      challengerStartupId: ids.challenger,
      wildcardStartupId: ids.fallback,
      startMode: "now",
      adminUserId: ids.championOwner
    });
    expect(initial.battle.status).toBe("live");
    expect(initial.auction.status).toBe("open");
    expect((await setBattlePaused({ battleId: initial.battle.id, action: "pause", adminUserId: ids.championOwner })).status).toBe("paused");
    expect((await setBattlePaused({ battleId: initial.battle.id, action: "resume", adminUserId: ids.championOwner })).status).toBe("live");
    expect((await setAuctionPaused({ auctionId: initial.auction.id, action: "pause", adminUserId: ids.championOwner })).status).toBe("paused");
  });
});
