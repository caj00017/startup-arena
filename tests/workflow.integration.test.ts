import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { migrate } from "drizzle-orm/pglite/migrator";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { getAdminData } from "@/db/queries";
import { auditLogs, auctions, battles, bids, events, magicLinks, sessions, startups, users, votes } from "@/db/schema";
import { claimMagicLinkAttempt, issueMagicLink, verifyMagicLinkToken } from "@/lib/auth";
import { getBattleReport, getFounderBattleReports, recordBrowserEvent, recordOutboundClick } from "@/services/analytics";
import { placeBid } from "@/services/auction";
import { createInitialBattle, setAuctionPaused, setBattlePaused } from "@/services/admin";
import { ensureNextBattle, finalizeBattle, runScheduledTransitions, settleAuction } from "@/services/rollover";
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

  it("reports unique, returning, referral, exploration, and moderation evidence", async () => {
    const [battle] = await db.select().from(battles).where(eq(battles.id, ids.battle));
    const priorBattleId = "03000000-0000-4000-8000-000000000099";
    await db.insert(battles).values({
      id: priorBattleId,
      championStartupId: ids.champion,
      challengerStartupId: ids.challenger,
      startsAt: new Date(battle.startsAt.getTime() - 2 * 86_400_000),
      endsAt: new Date(battle.startsAt.getTime() - 86_400_000),
      status: "finalized",
      winnerStartupId: ids.champion,
      finalizedAt: new Date(battle.startsAt.getTime() - 86_400_000)
    });
    await db.insert(events).values({
      eventType: "battle_impression",
      battleId: priorBattleId,
      sessionHash: "returning-visitor",
      createdAt: new Date(battle.startsAt.getTime() - 60_000)
    });

    await recordBrowserEvent({
      eventType: "battle_impression",
      battleId: ids.battle,
      referralStartupId: ids.champion,
      visitorHash: "returning-visitor"
    });
    await recordBrowserEvent({
      eventType: "battle_impression",
      battleId: ids.battle,
      visitorHash: "returning-visitor"
    });
    await recordBrowserEvent({
      eventType: "battle_impression",
      battleId: ids.battle,
      visitorHash: "new-visitor"
    });
    await expect(
      recordBrowserEvent({
        eventType: "battle_impression",
        battleId: ids.battle,
        referralStartupId: ids.bidder,
        visitorHash: "spoofed-referral"
      })
    ).rejects.toThrow("not part of this battle");

    await recordOutboundClick({
      battleId: ids.battle,
      startupId: ids.champion,
      visitorHash: "returning-visitor"
    });
    await recordOutboundClick({
      battleId: ids.battle,
      startupId: ids.challenger,
      visitorHash: "returning-visitor"
    });
    await recordOutboundClick({
      battleId: ids.battle,
      startupId: ids.challenger,
      visitorHash: "new-visitor"
    });
    await recordBrowserEvent({
      eventType: "share",
      battleId: ids.battle,
      startupId: ids.champion,
      userId: ids.championOwner,
      visitorHash: "founder-visitor"
    });
    await expect(
      recordBrowserEvent({
        eventType: "share",
        battleId: ids.battle,
        startupId: ids.champion,
        userId: ids.challengerOwner,
        visitorHash: "other-founder"
      })
    ).rejects.toThrow("Only the startup owner");

    await castVote({
      battleId: ids.battle,
      startupId: ids.champion,
      userId: ids.voter,
      ipHash: "report-ip-one",
      userAgentHash: "report-agent-one",
      visitorHash: "returning-visitor"
    });
    const [invalidVote] = await db
      .insert(votes)
      .values({
        battleId: ids.battle,
        startupId: ids.challenger,
        userId: ids.challengerOwner,
        ipHash: "report-ip-two",
        fraudStatus: "invalid"
      })
      .returning();
    await db.insert(auditLogs).values({
      actorUserId: ids.championOwner,
      action: "vote.moderated",
      entityType: "vote",
      entityId: invalidVote.id
    });

    const report = await getBattleReport(ids.battle);
    expect(report).not.toBeNull();
    expect(report).toMatchObject({
      uniqueVisitors: 2,
      verifiedVotes: 1,
      voteConversion: 0.5,
      returningVisitors: 1,
      returningVisitorRate: 0.5,
      exploredBoth: 1,
      exploredBothRate: 0.5,
      suspiciousVotes: 1,
      suspiciousVoteRate: 0.5,
      operationalInterventions: 1
    });
    expect(report?.champion).toMatchObject({
      outboundClicks: 1,
      uniqueOutboundVisitors: 1,
      founderShares: 1,
      referredVisitors: 1,
      referredVoters: 1,
      referralVoteConversion: 1
    });
    expect(report?.challenger).toMatchObject({
      outboundClicks: 2,
      uniqueOutboundVisitors: 2,
      referredVisitors: 0
    });

    const founderReports = await getFounderBattleReports(ids.championOwner);
    expect(founderReports.find((item) => item.battle.id === ids.battle)).toMatchObject({
      startup: { id: ids.champion },
      uniqueVisitors: 2,
      outboundClicks: 1,
      founderShares: 1,
      referredVisitors: 1
    });
  });

  it("accepts an eligible founder bid and captures the winner in mock mode", async () => {
    const bid = await placeBid({ auctionId: ids.auction, startupId: ids.bidder, userId: ids.bidderOwner, amountCents: 500 });
    expect(bid.amountCents).toBe(500);
    const settled = await settleAuction(ids.auction, new Date(Date.now() + 60_000));
    expect(settled.status).toBe("awarded");
    const [winningBid] = await db.select().from(bids).where(eq(bids.id, bid.id));
    expect(winningBid.paymentStatus).toBe("captured");
    const adminData = await getAdminData();
    expect(adminData.auctions.find((auction) => auction.id === ids.auction)?.status).toBe("awarded");
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

  it("recovers a finalized battle after its missing wildcard is corrected", async () => {
    const now = new Date();
    await db
      .update(auctions)
      .set({ closesAt: new Date(now.getTime() - 2_000), wildcardStartupId: null })
      .where(eq(auctions.id, ids.auction));
    await db
      .update(battles)
      .set({ endsAt: new Date(now.getTime() - 1_000) })
      .where(eq(battles.id, ids.battle));

    const firstRun = await runScheduledTransitions(now);
    expect(firstRun.battles[0]?.next.requiresWildcard).toBe(true);
    expect((await db.select().from(battles).where(eq(battles.previousBattleId, ids.battle)))).toHaveLength(0);
    const strandedAdminData = await getAdminData();
    expect(strandedAdminData.hasBattles).toBe(true);
    expect(strandedAdminData.battles).toHaveLength(0);

    await db
      .update(auctions)
      .set({ wildcardStartupId: ids.fallback })
      .where(eq(auctions.id, ids.auction));
    await runScheduledTransitions(new Date(now.getTime() + 1_000));

    const [nextBattle] = await db
      .select()
      .from(battles)
      .where(eq(battles.previousBattleId, ids.battle));
    expect(nextBattle.challengerStartupId).toBe(ids.fallback);
  });

  it("serializes overlapping attempts to create the next battle", async () => {
    await db.update(auctions).set({ status: "no_bid" }).where(eq(auctions.id, ids.auction));
    await db
      .update(battles)
      .set({ status: "finalized", winnerStartupId: ids.champion, finalizedAt: new Date() })
      .where(eq(battles.id, ids.battle));

    await Promise.all([ensureNextBattle(ids.battle), ensureNextBattle(ids.battle)]);

    expect(await db.select().from(battles).where(eq(battles.previousBattleId, ids.battle))).toHaveLength(1);
    const createdAudits = await db.select().from(auditLogs).where(eq(auditLogs.action, "battle.created"));
    expect(createdAudits).toHaveLength(1);
  });

  it("verifies once and atomically signs in only the requesting browser", async () => {
    const magic = await issueMagicLink("atomic@example.com");
    const token = new URLSearchParams(new URL(magic.verifyUrl).hash.slice(1)).get("token");
    expect(token).toBeTruthy();
    expect((await claimMagicLinkAttempt(magic.browserToken)).status).toBe("pending");
    expect((await claimMagicLinkAttempt("a-different-browser-token")).status).toBe("missing");

    const verifications = await Promise.all([
      verifyMagicLinkToken(token!),
      verifyMagicLinkToken(token!)
    ]);
    expect(verifications.filter(Boolean)).toHaveLength(1);
    expect(await db.select().from(sessions)).toHaveLength(0);

    const claims = await Promise.all([
      claimMagicLinkAttempt(magic.browserToken),
      claimMagicLinkAttempt(magic.browserToken)
    ]);

    expect(claims.filter((result) => result.status === "authenticated")).toHaveLength(1);
    expect(await db.select().from(sessions)).toHaveLength(1);
    const [link] = await db.select().from(magicLinks);
    expect(link.consumedAt).toBeInstanceOf(Date);
    expect(link.claimedAt).toBeInstanceOf(Date);
  });
});
