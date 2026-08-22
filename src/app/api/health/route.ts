import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { env } from "@/lib/env";
import { isMockPaymentMode } from "@/lib/payments";

export async function GET() {
  try {
    await db.execute(sql`select 1 as healthy`);
    return NextResponse.json({
      status: "ok",
      database: "connected",
      payments: isMockPaymentMode() ? "mock" : "stripe",
      email: env.RESEND_API_KEY ? "configured" : "development-link"
    });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503 });
  }
}
