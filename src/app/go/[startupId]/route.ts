import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { events, startups } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getRequestFingerprint } from "@/lib/security";
import { isPublicStartupStatus } from "@/lib/domain";

export async function GET(request: Request, { params }: { params: Promise<{ startupId: string }> }) {
  const { startupId } = await params;
  const [startup] = await db.select().from(startups).where(eq(startups.id, startupId)).limit(1);
  if (!startup || !isPublicStartupStatus(startup.status)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const battleId = url.searchParams.get("battle");
  const [user, fingerprint] = await Promise.all([getCurrentUser(), getRequestFingerprint()]);
  await db.insert(events).values({
    eventType: "outbound_click",
    battleId: battleId || undefined,
    startupId: startup.id,
    userId: user?.id,
    sessionHash: fingerprint.ipHash
  });

  return NextResponse.redirect(startup.url, 307);
}
