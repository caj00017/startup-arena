import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { env } from "@/lib/env";
import { assertSameOrigin } from "@/lib/security";
import { AuctionError, placeBid } from "@/services/auction";

const schema = z.object({
  auctionId: z.string().uuid(),
  startupId: z.string().uuid(),
  amountCents: z.number().int().min(100).max(env.MAX_BID_CENTS)
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const input = schema.parse(await request.json());
    const bid = await placeBid({ ...input, userId: user.id });
    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    if (error instanceof AuctionError) return NextResponse.json({ error: error.message }, { status: 409 });
    return jsonError(error);
  }
}
