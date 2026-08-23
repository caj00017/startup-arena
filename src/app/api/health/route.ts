import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";
import { db } from "@/db";
import { assertProductionSecrets, env } from "@/lib/env";
import { isMockPaymentMode } from "@/lib/payments";

export async function GET() {
  try {
    await connection();
    assertProductionSecrets();
    await db.execute(sql`select 1 as healthy`);
    return NextResponse.json({
      status: "ok",
      database: "connected",
      payments: isMockPaymentMode() ? "mock" : "stripe",
      email: env.RESEND_API_KEY ? "configured" : "development-link"
    });
  } catch (error) {
    console.error("Health check failed", error);
    return NextResponse.json({ status: "error", readiness: "failed" }, { status: 503 });
  }
}
