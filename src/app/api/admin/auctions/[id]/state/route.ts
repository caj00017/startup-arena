import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { setAuctionPaused } from "@/services/admin";

const schema = z.object({ action: z.enum(["pause", "resume"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await assertSameOrigin(request); const user = await getCurrentUser(); if (!user) return unauthorized(); if (user.role !== "admin") return forbidden(); const [{ id }, input] = await Promise.all([params, request.json().then((body) => schema.parse(body))]); return NextResponse.json(await setAuctionPaused({ auctionId: id, action: input.action, adminUserId: user.id })); }
  catch (error) { return jsonError(error); }
}
