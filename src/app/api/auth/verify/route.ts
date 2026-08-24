import { NextResponse } from "next/server";
import { z } from "zod";
import { claimMagicLinkForBrowser, verifyMagicLinkToken } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";

const schema = z.object({ token: z.string().min(32).max(512) });

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const { token } = schema.parse(await request.json());
    const link = await verifyMagicLinkToken(token);
    if (!link) {
      return NextResponse.json(
        { error: "This verification link is invalid or expired." },
        { status: 410 }
      );
    }

    const claim = await claimMagicLinkForBrowser(link.id);
    return NextResponse.json({
      status: claim.status === "authenticated" ? "authenticated" : "verified",
      redirect: claim.status === "authenticated" ? claim.nextPath : undefined
    });
  } catch (error) {
    return jsonError(error);
  }
}
