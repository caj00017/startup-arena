import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { auctions, battles, bids, events, startups, users, votes } from "./schema";

async function startupMap(ids: string[]) {
  if (ids.length === 0) return new Map();
  const rows = await db.select().from(startups).where(inArray(startups.id, ids));
  return new Map(rows.map((startup) => [startup.id, startup]));
}

async function battleVoteSummary(battleId: string) {
  const rows = await db
    .select({ startupId: votes.startupId, total: count() })
    .from(votes)
    .where(and(eq(votes.battleId, battleId), eq(votes.fraudStatus, "valid")))
    .groupBy(votes.startupId);
  return new Map(rows.map((row) => [row.startupId, Number(row.total)]));
}

export async function getActiveBattleData(userId?: string) {
  const [battle] = await db
    .select()
    .from(battles)
    .where(eq(battles.status, "live"))
    .orderBy(desc(battles.startsAt))
    .limit(1);
  if (!battle) return null;

  const [startupRows, voteSummary, auctionRows, userVoteRows, recentBattles] = await Promise.all([
    startupMap([battle.championStartupId, battle.challengerStartupId]),
    battleVoteSummary(battle.id),
    db.select().from(auctions).where(eq(auctions.battleId, battle.id)).limit(1),
    userId
      ? db
          .select()
          .from(votes)
          .where(and(eq(votes.battleId, battle.id), eq(votes.userId, userId)))
          .limit(1)
      : Promise.resolve([]),
    db
      .select()
      .from(battles)
      .where(eq(battles.status, "finalized"))
      .orderBy(desc(battles.finalizedAt))
      .limit(3)
  ]);

  const auction = auctionRows[0] ?? null;
  const bidRows = auction
    ? await db
        .select({ bid: bids, startup: startups })
        .from(bids)
        .innerJoin(startups, eq(startups.id, bids.startupId))
        .where(
          and(
            eq(bids.auctionId, auction.id),
            inArray(bids.status, ["valid", "outbid", "winning"])
          )
        )
        .orderBy(desc(bids.amountCents), asc(bids.createdAt))
        .limit(5)
    : [];

  const recentStartupRows = await startupMap(
    recentBattles.flatMap((item) => [item.championStartupId, item.challengerStartupId])
  );

  return {
    battle,
    champion: startupRows.get(battle.championStartupId)!,
    challenger: startupRows.get(battle.challengerStartupId)!,
    championVotes: voteSummary.get(battle.championStartupId) ?? 0,
    challengerVotes: voteSummary.get(battle.challengerStartupId) ?? 0,
    userVote: userVoteRows[0] ?? null,
    auction,
    bids: bidRows,
    recentBattles: recentBattles.map((item) => ({
      battle: item,
      champion: recentStartupRows.get(item.championStartupId)!,
      challenger: recentStartupRows.get(item.challengerStartupId)!
    }))
  };
}

export async function getBattleData(id: string, userId?: string) {
  const [battle] = await db.select().from(battles).where(eq(battles.id, id)).limit(1);
  if (!battle) return null;
  const [startupsById, voteSummary, userVoteRows] = await Promise.all([
    startupMap([battle.championStartupId, battle.challengerStartupId]),
    battleVoteSummary(battle.id),
    userId
      ? db
          .select()
          .from(votes)
          .where(and(eq(votes.battleId, battle.id), eq(votes.userId, userId)))
          .limit(1)
      : Promise.resolve([])
  ]);
  return {
    battle,
    champion: startupsById.get(battle.championStartupId)!,
    challenger: startupsById.get(battle.challengerStartupId)!,
    championVotes: voteSummary.get(battle.championStartupId) ?? battle.championVotes,
    challengerVotes: voteSummary.get(battle.challengerStartupId) ?? battle.challengerVotes,
    userVote: userVoteRows[0] ?? null
  };
}

export async function getStartupProfile(slug: string) {
  const [startup] = await db.select().from(startups).where(eq(startups.slug, slug)).limit(1);
  if (!startup) return null;

  const battleRows = await db
    .select()
    .from(battles)
    .where(
      and(
        eq(battles.status, "finalized"),
        sql`${startup.id} in (${battles.championStartupId}, ${battles.challengerStartupId})`
      )
    )
    .orderBy(desc(battles.finalizedAt));
  const opponentRows = await startupMap(
    battleRows.map((battle) =>
      battle.championStartupId === startup.id
        ? battle.challengerStartupId
        : battle.championStartupId
    )
  );

  const [clickResult] = await db
    .select({ total: count() })
    .from(events)
    .where(and(eq(events.startupId, startup.id), eq(events.eventType, "outbound_click")));

  const wins = battleRows.filter((battle) => battle.winnerStartupId === startup.id).length;
  return {
    startup,
    wins,
    losses: battleRows.length - wins,
    clicks: Number(clickResult?.total ?? 0),
    battles: battleRows.map((battle) => ({
      battle,
      opponent: opponentRows.get(
        battle.championStartupId === startup.id
          ? battle.challengerStartupId
          : battle.championStartupId
      )!
    }))
  };
}

export async function getAccountData(userId: string) {
  const ownedStartups = await db
    .select()
    .from(startups)
    .where(eq(startups.ownerId, userId))
    .orderBy(desc(startups.createdAt));
  const startupIds = ownedStartups.map((startup) => startup.id);
  const bidRows = startupIds.length
    ? await db
        .select({ bid: bids, auction: auctions })
        .from(bids)
        .innerJoin(auctions, eq(auctions.id, bids.auctionId))
        .where(inArray(bids.startupId, startupIds))
        .orderBy(desc(bids.createdAt))
        .limit(20)
    : [];
  const eventRows = startupIds.length
    ? await db
        .select({ startupId: events.startupId, type: events.eventType, total: count() })
        .from(events)
        .where(inArray(events.startupId, startupIds))
        .groupBy(events.startupId, events.eventType)
    : [];

  return { startups: ownedStartups, bids: bidRows, events: eventRows };
}

export async function getOwnedStartupIds(userId: string) {
  const rows = await db
    .select({ id: startups.id })
    .from(startups)
    .where(eq(startups.ownerId, userId));
  return rows.map((startup) => startup.id);
}

export async function getAdminData() {
  const [submissionRows, activeBattleRows, battlePresenceRows, auctionRows, voteReviewRows, approvedStartups] =
    await Promise.all([
      db.select().from(startups).where(eq(startups.status, "pending")).orderBy(asc(startups.createdAt)),
      db.select().from(battles).where(inArray(battles.status, ["live", "scheduled", "paused"])).orderBy(desc(battles.startsAt)),
      db.select({ id: battles.id }).from(battles).limit(1),
      db
        .select()
        .from(auctions)
        .orderBy(desc(auctions.createdAt))
        .limit(20),
      db
        .select({ vote: votes, user: users })
        .from(votes)
        .innerJoin(users, eq(users.id, votes.userId))
        .where(inArray(votes.fraudStatus, ["review", "pending"]))
        .orderBy(desc(votes.createdAt)),
      db.select().from(startups).where(eq(startups.status, "approved")).orderBy(asc(startups.name))
    ]);
  return {
    submissions: submissionRows,
    battles: activeBattleRows,
    hasBattles: battlePresenceRows.length > 0,
    auctions: auctionRows,
    votes: voteReviewRows,
    approvedStartups
  };
}
