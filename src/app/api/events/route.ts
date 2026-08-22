import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { events } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { assertSameOrigin, getRequestFingerprint } from "@/lib/security";

const schema = z.object({
  eventType: z.enum(["battle_impression", "card_view", "share"]),
  battleId: z.string().uuid().optional(),
  startupId: z.string().uuid().optional()
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const [input, user, fingerprint] = await Promise.all([
      request.json().then((body) => schema.parse(body)),
      getCurrentUser(),
      getRequestFingerprint()
    ]);
    await db.insert(events).values({
      eventType: input.eventType,
      battleId: input.battleId,
      startupId: input.startupId,
      userId: user?.id,
      sessionHash: fingerprint.ipHash,
      metadata: {}
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
