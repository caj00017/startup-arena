import { and, count, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, battles, events, votes } from "@/db/schema";
import { isBattleLive } from "@/lib/domain";

export class VoteError extends Error {}

export async function castVote(input: {
  battleId: string;
  startupId: string;
  userId: string;
  ipHash: string;
  userAgentHash: string;
}) {
  const [battle] = await db.select().from(battles).where(eq(battles.id, input.battleId)).limit(1);
  if (!battle || !isBattleLive(battle)) throw new VoteError("This battle is not accepting votes.");
  if (![battle.championStartupId, battle.challengerStartupId].includes(input.startupId)) {
    throw new VoteError("That startup is not part of this battle.");
  }

  const [recentFromIp] = await db
    .select({ total: count() })
    .from(votes)
    .where(
      and(
        eq(votes.ipHash, input.ipHash),
        gt(votes.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
      )
    );
  if (Number(recentFromIp?.total ?? 0) >= 25) {
    throw new VoteError("This network has reached the daily vote limit.");
  }

  const [existingVote] = await db
    .select({ id: votes.id })
    .from(votes)
    .where(and(eq(votes.battleId, input.battleId), eq(votes.userId, input.userId)))
    .limit(1);
  if (existingVote) throw new VoteError("You already voted in this battle.");

  try {
    return await db.transaction(async (tx) => {
      const [vote] = await tx
        .insert(votes)
        .values({
          battleId: input.battleId,
          startupId: input.startupId,
          userId: input.userId,
          ipHash: input.ipHash,
          userAgentHash: input.userAgentHash,
          fraudStatus: "valid"
        })
        .returning();

      await tx.insert(events).values({
        eventType: "vote",
        battleId: input.battleId,
        startupId: input.startupId,
        userId: input.userId
      });
      return vote;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new VoteError("You already voted in this battle.");
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string; cause?: unknown };
  return (
    candidate.code === "23505" ||
    /unique|duplicate/i.test(candidate.message || "") ||
    isUniqueViolation(candidate.cause)
  );
}

export async function moderateVote(input: {
  voteId: string;
  status: "valid" | "invalid" | "review";
  adminUserId: string;
}) {
  await db.transaction(async (tx) => {
    await tx.update(votes).set({ fraudStatus: input.status }).where(eq(votes.id, input.voteId));
    await tx.insert(auditLogs).values({
      actorUserId: input.adminUserId,
      action: "vote.moderated",
      entityType: "vote",
      entityId: input.voteId,
      metadata: { status: input.status }
    });
  });
}
