import { NextResponse } from "next/server";
import { assertProductionSecrets, env } from "@/lib/env";
import { secureEqual } from "@/lib/security";
import { runScheduledTransitions } from "@/services/rollover";

async function run(request: Request) {
  assertProductionSecrets();
  const authorization = request.headers.get("authorization") || "";
  const expected = `Bearer ${env.CRON_SECRET}`;
  if (!secureEqual(authorization, expected)) {
    return NextResponse.json({ error: "Invalid cron credentials." }, { status: 401 });
  }
  const result = await runScheduledTransitions();
  return NextResponse.json({ ok: true, result });
}

export const GET = run;
export const POST = run;
