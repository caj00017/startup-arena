import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { startups } from "@/db/schema";
import { getAnalyticsVisitorHash } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { isPublicStartupStatus } from "@/lib/domain";
import { recordOutboundClick } from "@/services/analytics";

export async function GET(request: Request, { params }: { params: Promise<{ startupId: string }> }) {
  const { startupId } = await params;
  const [startup] = await db.select().from(startups).where(eq(startups.id, startupId)).limit(1);
  if (!startup || !isPublicStartupStatus(startup.status)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = new URL(request.url);
  const battleResult = z.string().uuid().safeParse(url.searchParams.get("battle"));
  const [user, visitorHash] = await Promise.all([
    getCurrentUser(),
    getAnalyticsVisitorHash()
  ]);
  await recordOutboundClick({
    battleId: battleResult.success ? battleResult.data : undefined,
    startupId: startup.id,
    userId: user?.id,
    visitorHash
  });

  return NextResponse.redirect(startup.url, 307);
}
