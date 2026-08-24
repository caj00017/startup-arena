import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lt,
  lte,
  ne,
  or
} from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  auctions,
  battles,
  events,
  startups,
  votes,
  type Battle,
  type Startup,
  type Vote
} from "@/db/schema";
import { isBattleLive } from "@/lib/domain";

type EventRow = typeof events.$inferSelect;

const manualInterventionActions = [
  "battle.paused",
  "battle.resumed",
  "auction.paused",
  "auction.resumed",
  "auction.wildcard_set",
  "vote.moderated"
];

export type BrowserEventInput = {
  eventType: "battle_impression" | "card_view" | "share";
  battleId: string;
  startupId?: string;
  referralStartupId?: string;
  userId?: string;
  visitorHash: string;
};

export async function recordBrowserEvent(input: BrowserEventInput) {
  const [battle] = await db
    .select()
    .from(battles)
    .where(eq(battles.id, input.battleId))
    .limit(1);
  if (!battle) throw new Error("Battle not found.");

  const participantIds = new Set([
    battle.championStartupId,
    battle.challengerStartupId
  ]);
  if (input.startupId && !participantIds.has(input.startupId)) {
    throw new Error("That startup is not part of this battle.");
  }
  if (input.referralStartupId && !participantIds.has(input.referralStartupId)) {
    throw new Error("That referral is not part of this battle.");
  }

  if (input.eventType === "share") {
    if (!isBattleLive(battle)) {
      throw new Error("This battle is no longer accepting founder shares.");
    }
    if (!input.userId || !input.startupId) {
      throw new Error("A startup owner is required to record a share.");
    }
    const [ownedStartup] = await db
      .select({ id: startups.id })
      .from(startups)
      .where(and(eq(startups.id, input.startupId), eq(startups.ownerId, input.userId)))
      .limit(1);
    if (!ownedStartup) throw new Error("Only the startup owner can record this share.");
  }

  const rows: Array<typeof events.$inferInsert> = [
    {
      eventType: input.eventType,
      battleId: input.battleId,
      startupId: input.startupId,
      userId: input.userId,
      sessionHash: input.visitorHash,
      metadata: { visitorIdentity: "anonymous_v1" }
    }
  ];
  if (input.eventType === "battle_impression" && input.referralStartupId) {
    rows.push({
      eventType: "referral_visit",
      battleId: input.battleId,
      startupId: input.referralStartupId,
      userId: input.userId,
      sessionHash: input.visitorHash,
      metadata: { visitorIdentity: "anonymous_v1", source: "founder_share" }
    });
  }

  await db.insert(events).values(rows);
}

export async function recordOutboundClick(input: {
  battleId?: string;
  startupId: string;
  userId?: string;
  visitorHash: string;
}) {
  let trackedBattleId: string | undefined;
  if (input.battleId) {
    const [battle] = await db
      .select({
        id: battles.id,
        championStartupId: battles.championStartupId,
        challengerStartupId: battles.challengerStartupId
      })
      .from(battles)
      .where(eq(battles.id, input.battleId))
      .limit(1);
    if (
      battle &&
      [battle.championStartupId, battle.challengerStartupId].includes(input.startupId)
    ) {
      trackedBattleId = battle.id;
    }
  }

  await db.insert(events).values({
    eventType: "outbound_click",
    battleId: trackedBattleId,
    startupId: input.startupId,
    userId: input.userId,
    sessionHash: input.visitorHash,
    metadata: { visitorIdentity: "anonymous_v1" }
  });
}

function visitorSet(rows: EventRow[], eventType: string, startupId?: string) {
  return new Set(
    rows
      .filter(
        (event) =>
          event.eventType === eventType &&
          (!startupId || event.startupId === startupId) &&
          event.sessionHash
      )
      .map((event) => event.sessionHash!)
  );
}

function intersectionSize(left: Set<string>, right: Set<string>) {
  let total = 0;
  for (const value of left) if (right.has(value)) total += 1;
  return total;
}

function ratio(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function startupMetrics(input: {
  startup: Startup;
  eventRows: EventRow[];
  validVoterIds: Set<string>;
}) {
  const clickRows = input.eventRows.filter(
    (event) =>
      event.eventType === "outbound_click" && event.startupId === input.startup.id
  );
  const clickVisitors = visitorSet(
    input.eventRows,
    "outbound_click",
    input.startup.id
  );
  const referredVisitors = visitorSet(
    input.eventRows,
    "referral_visit",
    input.startup.id
  );
  const validVoteVisitors = new Set(
    input.eventRows
      .filter(
        (event) =>
          event.eventType === "vote" &&
          event.userId &&
          input.validVoterIds.has(event.userId) &&
          event.sessionHash
      )
      .map((event) => event.sessionHash!)
  );
  const referredVoters = intersectionSize(referredVisitors, validVoteVisitors);

  return {
    startup: input.startup,
    outboundClicks: clickRows.length,
    uniqueOutboundVisitors: clickVisitors.size,
    founderShares: input.eventRows.filter(
      (event) => event.eventType === "share" && event.startupId === input.startup.id
    ).length,
    referredVisitors: referredVisitors.size,
    referredVoters,
    referralVoteConversion: ratio(referredVoters, referredVisitors.size)
  };
}

export function summarizeBattleAnalytics(input: {
  battle: Battle;
  champion: Startup;
  challenger: Startup;
  eventRows: EventRow[];
  voteRows: Vote[];
  priorVisitorHashes?: Set<string>;
  operationalInterventions?: number;
}) {
  const visitors = visitorSet(input.eventRows, "battle_impression");
  const validVotes = input.voteRows.filter((vote) => vote.fraudStatus === "valid");
  const validVoterIds = new Set(validVotes.map((vote) => vote.userId));
  const suspiciousVotes = input.voteRows.filter((vote) =>
    ["invalid", "review"].includes(vote.fraudStatus)
  ).length;
  const champion = startupMetrics({
    startup: input.champion,
    eventRows: input.eventRows,
    validVoterIds
  });
  const challenger = startupMetrics({
    startup: input.challenger,
    eventRows: input.eventRows,
    validVoterIds
  });
  const championVisitors = visitorSet(
    input.eventRows,
    "outbound_click",
    input.champion.id
  );
  const challengerVisitors = visitorSet(
    input.eventRows,
    "outbound_click",
    input.challenger.id
  );
  const exploredBoth = intersectionSize(championVisitors, challengerVisitors);
  const returningVisitors = intersectionSize(
    visitors,
    input.priorVisitorHashes ?? new Set<string>()
  );

  return {
    battle: input.battle,
    champion,
    challenger,
    uniqueVisitors: visitors.size,
    verifiedVotes: validVotes.length,
    voteConversion: ratio(validVotes.length, visitors.size),
    returningVisitors,
    returningVisitorRate: ratio(returningVisitors, visitors.size),
    exploredBoth,
    exploredBothRate: ratio(exploredBoth, visitors.size),
    suspiciousVotes,
    suspiciousVoteRate: ratio(suspiciousVotes, input.voteRows.length),
    totalVotes: input.voteRows.length,
    operationalInterventions: input.operationalInterventions ?? 0
  };
}

export async function getBattleReport(battleId: string) {
  const [battle] = await db
    .select()
    .from(battles)
    .where(eq(battles.id, battleId))
    .limit(1);
  if (!battle) return null;

  const [startupRows, eventRows, voteRows, auctionRows, priorRows] = await Promise.all([
    db
      .select()
      .from(startups)
      .where(inArray(startups.id, [battle.championStartupId, battle.challengerStartupId])),
    db
      .select()
      .from(events)
      .where(
        and(
          eq(events.battleId, battle.id),
          gte(events.createdAt, battle.startsAt),
          lte(events.createdAt, battle.endsAt)
        )
      ),
    db.select().from(votes).where(eq(votes.battleId, battle.id)),
    db.select({ id: auctions.id }).from(auctions).where(eq(auctions.battleId, battle.id)),
    db
      .select({ sessionHash: events.sessionHash })
      .from(events)
      .where(
        and(
          eq(events.eventType, "battle_impression"),
          ne(events.battleId, battle.id),
          isNotNull(events.sessionHash),
          gte(events.createdAt, new Date(battle.startsAt.getTime() - 7 * 24 * 60 * 60 * 1000)),
          lt(events.createdAt, battle.startsAt)
        )
      )
  ]);
  const startupById = new Map(startupRows.map((startup) => [startup.id, startup]));
  const champion = startupById.get(battle.championStartupId);
  const challenger = startupById.get(battle.challengerStartupId);
  if (!champion || !challenger) return null;

  const entityIds = [
    battle.id,
    ...auctionRows.map((auction) => auction.id),
    ...voteRows.map((vote) => vote.id)
  ];
  const interventionRows = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and(
        inArray(auditLogs.entityId, entityIds),
        inArray(auditLogs.action, manualInterventionActions)
      )
    );

  return summarizeBattleAnalytics({
    battle,
    champion,
    challenger,
    eventRows,
    voteRows,
    priorVisitorHashes: new Set(
      priorRows.flatMap((row) => (row.sessionHash ? [row.sessionHash] : []))
    ),
    operationalInterventions: interventionRows.length
  });
}

export async function getBattleReportList() {
  const battleRows = await db
    .select()
    .from(battles)
    .orderBy(desc(battles.startsAt))
    .limit(20);
  if (battleRows.length === 0) return [];
  const startupRows = await db
    .select()
    .from(startups)
    .where(
      inArray(
        startups.id,
        battleRows.flatMap((battle) => [
          battle.championStartupId,
          battle.challengerStartupId
        ])
      )
    );
  const startupById = new Map(startupRows.map((startup) => [startup.id, startup]));
  return battleRows.map((battle) => ({
    battle,
    champion: startupById.get(battle.championStartupId)!,
    challenger: startupById.get(battle.challengerStartupId)!
  }));
}

export async function getFounderBattleReports(userId: string) {
  const ownedStartups = await db
    .select()
    .from(startups)
    .where(eq(startups.ownerId, userId));
  const ownedIds = ownedStartups.map((startup) => startup.id);
  if (ownedIds.length === 0) return [];

  const battleRows = await db
    .select()
    .from(battles)
    .where(
      or(
        inArray(battles.championStartupId, ownedIds),
        inArray(battles.challengerStartupId, ownedIds)
      )
    )
    .orderBy(desc(battles.startsAt))
    .limit(20);
  if (battleRows.length === 0) return [];

  const battleIds = battleRows.map((battle) => battle.id);
  const [participantRows, eventRows, voteRows] = await Promise.all([
    db
      .select()
      .from(startups)
      .where(
        inArray(
          startups.id,
          battleRows.flatMap((battle) => [
            battle.championStartupId,
            battle.challengerStartupId
          ])
        )
      ),
    db.select().from(events).where(inArray(events.battleId, battleIds)),
    db.select().from(votes).where(inArray(votes.battleId, battleIds))
  ]);
  const startupById = new Map(participantRows.map((startup) => [startup.id, startup]));

  return battleRows.flatMap((battle) => {
    const champion = startupById.get(battle.championStartupId);
    const challenger = startupById.get(battle.challengerStartupId);
    if (!champion || !challenger) return [];
    const summary = summarizeBattleAnalytics({
      battle,
      champion,
      challenger,
      eventRows: eventRows.filter(
        (event) =>
          event.battleId === battle.id &&
          event.createdAt >= battle.startsAt &&
          event.createdAt <= battle.endsAt
      ),
      voteRows: voteRows.filter((vote) => vote.battleId === battle.id)
    });
    return [summary.champion, summary.challenger]
      .filter((side) => ownedIds.includes(side.startup.id))
      .map((side) => ({
        battle,
        startup: side.startup,
        opponent: side.startup.id === champion.id ? challenger : champion,
        uniqueVisitors: summary.uniqueVisitors,
        verifiedVotes: summary.verifiedVotes,
        outboundClicks: side.outboundClicks,
        uniqueOutboundVisitors: side.uniqueOutboundVisitors,
        founderShares: side.founderShares,
        referredVisitors: side.referredVisitors,
        referralVoteConversion: side.referralVoteConversion
      }));
  });
}
