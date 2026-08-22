import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { runScheduledTransitions } from "@/services/rollover";

export async function POST(request: Request) {
  try { await assertSameOrigin(request); const user = await getCurrentUser(); if (!user) return unauthorized(); if (user.role !== "admin") return forbidden(); return NextResponse.json({ ok: true, result: await runScheduledTransitions() }); }
  catch (error) { return jsonError(error); }
}
