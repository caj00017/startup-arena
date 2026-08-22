import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { moderateVote } from "@/services/voting";

const schema = z.object({ status: z.enum(["valid", "invalid", "review"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await assertSameOrigin(request); const user = await getCurrentUser(); if (!user) return unauthorized(); if (user.role !== "admin") return forbidden(); const [{ id }, input] = await Promise.all([params, request.json().then((body) => schema.parse(body))]); await moderateVote({ voteId: id, status: input.status, adminUserId: user.id }); return NextResponse.json({ ok: true }); }
  catch (error) { return jsonError(error); }
}
