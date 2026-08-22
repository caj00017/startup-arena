import { and, asc, count, desc, eq, inArray, lte, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  auctions,
  battles,
  bids,
  startups,
  users,
  votes,
  type Auction
} from "@/db/schema";
import { determineBattleWinner } from "@/lib/domain";
import { captureWinningBid } from "@/lib/payments";

export async function settleAuction(auctionId: string, now = new Date()) {
  const [auction] = await db.select().from(auctions).where(eq(auctions.id, auctionId)).limit(1);
  if (!auction) throw new Error("Auction not found.");
  if (auction.status === "awarded" || auction.status === "no_bid") return auction;
  if (auction.status === "open" && auction.closesAt > now) return auction;

  await db
    .update(auctions)
    .set({ status: "settling", updatedAt: now })
    .where(and(eq(auctions.id, auctionId), inArray(auctions.status, ["open", "closed", "settling"])));

  const candidates = await db
    .select({ bid: bids, user: users })
    .from(bids)
    .innerJoin(users, eq(users.id, bids.userId))
    .where(
      and(
        eq(bids.auctionId, auctionId),
        inArray(bids.status, ["valid", "outbid", "winning"]),
        inArray(bids.paymentStatus, ["authorized", "captured"])
      )
    )
    .orderBy(desc(bids.amountCents), asc(bids.createdAt));

  for (const candidate of candidates) {
    if (candidate.bid.paymentStatus === "captured") {
      return awardAuction(auction, candidate.bid.id, candidate.bid.paymentReference || "captured");
    }

    const payment = await captureWinningBid(candidate.bid, candidate.user);
    if (payment.succeeded) {
      return awardAuction(auction, candidate.bid.id, payment.reference);
    }

    await db
      .update(bids)
      .set({ status: "payment_failed", paymentStatus: "failed", updatedAt: new Date() })
      .where(eq(bids.id, candidate.bid.id));
  }

  const [noBidAuction] = await db
    .update(auctions)
    .set({ status: "no_bid", updatedAt: new Date() })
    .where(eq(auctions.id, auctionId))
    .returning();
  return noBidAuction;
}

async function awardAuction(auction: Auction, winningBidId: string, paymentReference: string) {
  return db.transaction(async (tx) => {
    await tx
      .update(bids)
      .set({ status: "outbid", updatedAt: new Date() })
      .where(
        and(
          eq(bids.auctionId, auction.id),
          ne(bids.id, winningBidId),
          inArray(bids.status, ["valid", "outbid"])
        )
      );

    await tx
      .update(bids)
      .set({
        status: "winning",
        paymentStatus: "captured",
        paymentReference,
        updatedAt: new Date()
      })
      .where(eq(bids.id, winningBidId));

    const [awarded] = await tx
      .update(auctions)
      .set({ status: "awarded", winningBidId, updatedAt: new Date() })
      .where(eq(auctions.id, auction.id))
      .returning();

    await tx.insert(auditLogs).values({
      action: "auction.awarded",
      entityType: "auction",
      entityId: auction.id,
      metadata: { winningBidId, paymentReference }
    });

    return awarded;
  });
}

export async function finalizeBattle(battleId: string, now = new Date()) {
  const [battle] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
  if (!battle) throw new Error("Battle not found.");
  if (battle.status === "finalized") return battle;
  if (battle.status === "live" && battle.endsAt > now) return battle;

  await db
    .update(battles)
    .set({ status: "validating", updatedAt: now })
    .where(and(eq(battles.id, battleId), inArray(battles.status, ["live", "ended", "validating"])));

  const groupedVotes = await db
    .select({ startupId: votes.startupId, total: count() })
    .from(votes)
    .where(and(eq(votes.battleId, battleId), eq(votes.fraudStatus, "valid")))
    .groupBy(votes.startupId);

  const championVotes = Number(
    groupedVotes.find((row) => row.startupId === battle.championStartupId)?.total ?? 0
  );
  const challengerVotes = Number(
    groupedVotes.find((row) => row.startupId === battle.challengerStartupId)?.total ?? 0
  );
  const winnerStartupId = determineBattleWinner({
    championStartupId: battle.championStartupId,
    challengerStartupId: battle.challengerStartupId,
    championVotes,
    challengerVotes
  });

  const [finalized] = await db
    .update(battles)
    .set({
      status: "finalized",
      winnerStartupId,
      championVotes,
      challengerVotes,
      finalizedAt: now,
      updatedAt: now
    })
    .where(eq(battles.id, battleId))
    .returning();

  await db.insert(auditLogs).values({
    action: "battle.finalized",
    entityType: "battle",
    entityId: battleId,
    metadata: { winnerStartupId, championVotes, challengerVotes }
  });

  return finalized;
}

export async function ensureNextBattle(battleId: string, now = new Date()) {
  const [existing] = await db
    .select()
    .from(battles)
    .where(eq(battles.previousBattleId, battleId))
    .limit(1);
  if (existing) return { battle: existing, created: false, requiresWildcard: false };

  const [current] = await db.select().from(battles).where(eq(battles.id, battleId)).limit(1);
  if (!current || current.status !== "finalized" || !current.winnerStartupId) {
    return { battle: null, created: false, requiresWildcard: false };
  }

  const [auction] = await db
    .select()
    .from(auctions)
    .where(eq(auctions.battleId, battleId))
    .limit(1);
  if (!auction || !["awarded", "no_bid"].includes(auction.status)) {
    return { battle: null, created: false, requiresWildcard: false };
  }

  let challengerStartupId = auction.wildcardStartupId;
  if (auction.winningBidId) {
    const [winningBid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, auction.winningBidId))
      .limit(1);
    challengerStartupId = winningBid?.startupId ?? challengerStartupId;
  }

  if (!challengerStartupId || challengerStartupId === current.winnerStartupId) {
    return { battle: null, created: false, requiresWildcard: true };
  }

  const [approvedChallenger] = await db
    .select({ id: startups.id })
    .from(startups)
    .where(and(eq(startups.id, challengerStartupId), eq(startups.status, "approved")))
    .limit(1);
  if (!approvedChallenger) {
    return { battle: null, created: false, requiresWildcard: true };
  }

  const startsAt = current.endsAt;
  const endsAt = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000);
  const closesAt = new Date(endsAt.getTime() - 60 * 60 * 1000);
  const championStreakAtStart =
    current.winnerStartupId === current.championStartupId
      ? current.championStreakAtStart + 1
      : 1;

  return db.transaction(async (tx) => {
    const [nextBattle] = await tx
      .insert(battles)
      .values({
        previousBattleId: current.id,
        championStartupId: current.winnerStartupId!,
        challengerStartupId: challengerStartupId!,
        startsAt,
        endsAt,
        status: startsAt <= now ? "live" : "scheduled",
        championStreakAtStart
      })
      .returning();

    await tx.insert(auctions).values({
      battleId: nextBattle.id,
      opensAt: startsAt,
      closesAt,
      status: startsAt <= now ? "open" : "open",
      minimumBidCents: auction.minimumBidCents,
      minimumIncrementCents: auction.minimumIncrementCents
    });

    await tx.insert(auditLogs).values({
      action: "battle.created",
      entityType: "battle",
      entityId: nextBattle.id,
      metadata: { previousBattleId: current.id }
    });

    return { battle: nextBattle, created: true, requiresWildcard: false };
  });
}

export async function runScheduledTransitions(now = new Date()) {
  const dueAuctions = await db
    .select({ id: auctions.id })
    .from(auctions)
    .where(and(inArray(auctions.status, ["open", "closed", "settling"]), lte(auctions.closesAt, now)));

  const auctionResults = [];
  for (const auction of dueAuctions) auctionResults.push(await settleAuction(auction.id, now));

  const dueBattles = await db
    .select({ id: battles.id })
    .from(battles)
    .where(and(inArray(battles.status, ["live", "ended", "validating"]), lte(battles.endsAt, now)));

  const battleResults = [];
  for (const battle of dueBattles) {
    const finalized = await finalizeBattle(battle.id, now);
    const next = await ensureNextBattle(battle.id, now);
    battleResults.push({ finalized, next });
  }

  await db
    .update(battles)
    .set({ status: "live", updatedAt: now })
    .where(and(eq(battles.status, "scheduled"), lte(battles.startsAt, now)));

  return { auctions: auctionResults, battles: battleResults };
}
