import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getAnalyticsVisitorHash, parseFounderReferralCode } from "@/lib/analytics";
import { jsonError } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { recordBrowserEvent } from "@/services/analytics";

const schema = z.object({
  eventType: z.enum(["battle_impression", "card_view", "share"]),
  battleId: z.string().uuid(),
  startupId: z.string().uuid().optional(),
  referralCode: z.string().max(160).optional()
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const [input, user, visitorHash] = await Promise.all([
      request.json().then((body) => schema.parse(body)),
      getCurrentUser(),
      getAnalyticsVisitorHash()
    ]);
    const referral = parseFounderReferralCode(input.referralCode);
    await recordBrowserEvent({
      eventType: input.eventType,
      battleId: input.battleId,
      startupId: input.startupId,
      referralStartupId: referral?.battleId === input.battleId ? referral.startupId : undefined,
      userId: user?.id,
      visitorHash
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
