import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { battles, votes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin, getRequestFingerprint, verifyTurnstile } from "@/lib/security";
import { castVote, VoteError } from "@/services/voting";

const schema = z.object({
  battleId: z.string().uuid(),
  startupId: z.string().uuid(),
  turnstileToken: z.string().max(2_048).optional()
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user?.emailVerifiedAt) return unauthorized();
    const input = schema.parse(await request.json());
    if (!(await verifyTurnstile(input.turnstileToken))) {
      return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
    }
    const fingerprint = await getRequestFingerprint();
    await castVote({ ...input, userId: user.id, ...fingerprint });

    const [battle] = await db.select().from(battles).where(eq(battles.id, input.battleId)).limit(1);
    const grouped = await db
      .select({ startupId: votes.startupId, total: count() })
      .from(votes)
      .where(and(eq(votes.battleId, input.battleId), eq(votes.fraudStatus, "valid")))
      .groupBy(votes.startupId);
    return NextResponse.json({
      ok: true,
      championVotes: Number(grouped.find((row) => row.startupId === battle?.championStartupId)?.total ?? 0),
      challengerVotes: Number(grouped.find((row) => row.startupId === battle?.challengerStartupId)?.total ?? 0)
    });
  } catch (error) {
    if (error instanceof VoteError) return NextResponse.json({ error: error.message }, { status: 409 });
    return jsonError(error);
  }
}
