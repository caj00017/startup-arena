import { and, eq, inArray, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import {
  battles,
  events,
  magicLinks,
  sessions,
  votes,
  type Battle
} from "@/db/schema";

export const rawDataRetentionDays = 30;
export const rawDataRetentionMs = rawDataRetentionDays * 24 * 60 * 60 * 1000;

type RetentionBattle = Pick<
  Battle,
  "status" | "finalizedAt" | "updatedAt"
>;

export function battleRawDataExpiresAt(battle: RetentionBattle) {
  const terminalAt =
    battle.status === "finalized"
      ? battle.finalizedAt ?? battle.updatedAt
      : battle.status === "cancelled"
        ? battle.updatedAt
        : null;

  return terminalAt
    ? new Date(terminalAt.getTime() + rawDataRetentionMs)
    : null;
}

export function isBattleRawDataAvailable(
  battle: RetentionBattle,
  now = new Date()
) {
  const expiresAt = battleRawDataExpiresAt(battle);
  return !expiresAt || expiresAt > now;
}

export async function runRetentionCleanup(now = new Date()) {
  const cutoff = new Date(now.getTime() - rawDataRetentionMs);

  return db.transaction(async (tx) => {
    const expiredBattleIds = tx
      .select({ id: battles.id })
      .from(battles)
      .where(
        or(
          and(
            eq(battles.status, "finalized"),
            or(
              lte(battles.finalizedAt, cutoff),
              and(isNull(battles.finalizedAt), lte(battles.updatedAt, cutoff))
            )
          ),
          and(eq(battles.status, "cancelled"), lte(battles.updatedAt, cutoff))
        )
      );

    const removedSessions = await tx
      .delete(sessions)
      .where(lte(sessions.expiresAt, now))
      .returning({ id: sessions.id });
    const removedMagicLinks = await tx
      .delete(magicLinks)
      .where(lte(magicLinks.expiresAt, now))
      .returning({ id: magicLinks.id });
    const removedEvents = await tx
      .delete(events)
      .where(
        or(
          and(isNull(events.battleId), lte(events.createdAt, cutoff)),
          inArray(events.battleId, expiredBattleIds)
        )
      )
      .returning({ id: events.id });
    const removedVotes = await tx
      .delete(votes)
      .where(inArray(votes.battleId, expiredBattleIds))
      .returning({ id: votes.id });

    return {
      cutoff: cutoff.toISOString(),
      sessions: removedSessions.length,
      magicLinks: removedMagicLinks.length,
      events: removedEvents.length,
      votes: removedVotes.length
    };
  });
}
