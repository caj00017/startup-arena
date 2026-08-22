import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { createInitialBattle } from "@/services/admin";

const schema = z.object({ championStartupId: z.string().uuid(), challengerStartupId: z.string().uuid(), wildcardStartupId: z.string().uuid().optional(), startMode: z.enum(["now", "next_midnight_utc"]) });
export async function POST(request: Request) {
  try { await assertSameOrigin(request); const user = await getCurrentUser(); if (!user) return unauthorized(); if (user.role !== "admin") return forbidden(); const input = schema.parse(await request.json()); return NextResponse.json(await createInitialBattle({ ...input, adminUserId: user.id }), { status: 201 }); }
  catch (error) { return jsonError(error); }
}
