import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { forbidden, jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";
import { reviewStartup, updateStartupPresentation } from "@/services/submissions";

const schema = z.object({
  status: z.enum(["approved", "rejected", "suspended"]).optional(),
  name: z.string().trim().min(2).max(60).optional(),
  tagline: z.string().trim().min(15).max(160).optional(),
  url: z.string().url().max(500).optional()
}).refine((value) => Object.keys(value).length > 0, "No update was supplied.");
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { await assertSameOrigin(request); const user = await getCurrentUser(); if (!user) return unauthorized(); if (user.role !== "admin") return forbidden(); const [{ id }, input] = await Promise.all([params, request.json().then((body) => schema.parse(body))]); let startup = input.status ? await reviewStartup({ startupId: id, status: input.status, adminUserId: user.id }) : null; if (input.name || input.tagline || input.url) startup = await updateStartupPresentation({ startupId: id, adminUserId: user.id, name: input.name, tagline: input.tagline, url: input.url }); return NextResponse.json({ startup }); }
  catch (error) { return jsonError(error); }
}
