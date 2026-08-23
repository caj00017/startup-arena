import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, auctions, battles, startups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";

const schema = z.object({ startupId: z.string().uuid() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "admin") return forbidden();

    const [{ id }, input] = await Promise.all([
      params,
      request.json().then((body) => schema.parse(body))
    ]);
    const [[startup], [context]] = await Promise.all([
      db.select().from(startups).where(eq(startups.id, input.startupId)).limit(1),
      db
        .select({ auction: auctions, battle: battles })
        .from(auctions)
        .innerJoin(battles, eq(battles.id, auctions.battleId))
        .where(eq(auctions.id, id))
        .limit(1)
    ]);

    if (!context) throw new Error("Auction not found.");
    if (!startup || startup.status !== "approved") {
      throw new Error("Wildcard startup must be approved.");
    }
    if (
      input.startupId === context.battle.championStartupId ||
      input.startupId === context.battle.challengerStartupId
    ) {
      throw new Error("Wildcard startup cannot already be in this battle.");
    }

    await db.transaction(async (tx) => {
      await tx
        .update(auctions)
        .set({ wildcardStartupId: input.startupId, updatedAt: new Date() })
        .where(eq(auctions.id, id));
      await tx.insert(auditLogs).values({
        actorUserId: user.id,
        action: "auction.wildcard_set",
        entityType: "auction",
        entityId: id,
        metadata: { startupId: input.startupId }
      });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
