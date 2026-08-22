import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, auctions, battles, startups } from "@/db/schema";

export async function createInitialBattle(input: {
  championStartupId: string;
  challengerStartupId: string;
  wildcardStartupId?: string;
  startMode: "now" | "next_midnight_utc";
  adminUserId: string;
}) {
  const participantIds = [
    input.championStartupId,
    input.challengerStartupId,
    ...(input.wildcardStartupId ? [input.wildcardStartupId] : [])
  ];
  if (new Set(participantIds).size !== participantIds.length) {
    throw new Error("Champion, challenger, and wildcard must be different startups.");
  }

  const [existing] = await db
    .select({ id: battles.id })
    .from(battles)
    .where(inArray(battles.status, ["live", "scheduled", "paused"]))
    .limit(1);
  if (existing) throw new Error("An active or scheduled battle already exists.");

  const approved = await db
    .select({ id: startups.id })
    .from(startups)
    .where(and(inArray(startups.id, participantIds), eq(startups.status, "approved")));
  if (approved.length !== participantIds.length) {
    throw new Error("Every selected startup must be approved.");
  }

  const now = new Date();
  const startsAt = new Date(now);
  if (input.startMode === "next_midnight_utc") {
    startsAt.setUTCHours(24, 0, 0, 0);
  }
  const endsAt = new Date(startsAt.getTime() + 24 * 60 * 60 * 1000);
  const closesAt = new Date(endsAt.getTime() - 60 * 60 * 1000);

  return db.transaction(async (tx) => {
    const [battle] = await tx
      .insert(battles)
      .values({
        championStartupId: input.championStartupId,
        challengerStartupId: input.challengerStartupId,
        startsAt,
        endsAt,
        status: input.startMode === "now" ? "live" : "scheduled",
        championStreakAtStart: 0
      })
      .returning();
    const [auction] = await tx
      .insert(auctions)
      .values({
        battleId: battle.id,
        opensAt: startsAt,
        closesAt,
        status: "open",
        wildcardStartupId: input.wildcardStartupId
      })
      .returning();
    await tx.insert(auditLogs).values({
      actorUserId: input.adminUserId,
      action: "battle.initial_created",
      entityType: "battle",
      entityId: battle.id,
      metadata: { auctionId: auction.id, startMode: input.startMode }
    });
    return { battle, auction };
  });
}

export async function setBattlePaused(input: {
  battleId: string;
  action: "pause" | "resume";
  adminUserId: string;
}) {
  const [battle] = await db.select().from(battles).where(eq(battles.id, input.battleId)).limit(1);
  if (!battle) throw new Error("Battle not found.");
  const now = new Date();
  const status =
    input.action === "pause"
      ? "paused"
      : now < battle.startsAt
        ? "scheduled"
        : now < battle.endsAt
          ? "live"
          : "ended";
  await db.transaction(async (tx) => {
    await tx.update(battles).set({ status, updatedAt: now }).where(eq(battles.id, battle.id));
    await tx.insert(auditLogs).values({ actorUserId: input.adminUserId, action: `battle.${input.action}d`, entityType: "battle", entityId: battle.id });
  });
  return { status };
}

export async function setAuctionPaused(input: {
  auctionId: string;
  action: "pause" | "resume";
  adminUserId: string;
}) {
  const [auction] = await db.select().from(auctions).where(eq(auctions.id, input.auctionId)).limit(1);
  if (!auction) throw new Error("Auction not found.");
  const status = input.action === "pause" ? "paused" : new Date() < auction.closesAt ? "open" : "closed";
  await db.transaction(async (tx) => {
    await tx.update(auctions).set({ status, updatedAt: new Date() }).where(eq(auctions.id, auction.id));
    await tx.insert(auditLogs).values({ actorUserId: input.adminUserId, action: `auction.${input.action}d`, entityType: "auction", entityId: auction.id });
  });
  return { status };
}
