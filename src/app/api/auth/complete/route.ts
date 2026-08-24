import { NextResponse } from "next/server";
import { claimMagicLinkForBrowser, getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    if (await getCurrentUser()) {
      return NextResponse.json({ status: "authenticated" });
    }

    const result = await claimMagicLinkForBrowser();
    return NextResponse.json(
      {
        status: result.status,
        redirect: result.status === "authenticated" ? result.nextPath : undefined
      },
      { status: result.status === "expired" ? 410 : 200 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
