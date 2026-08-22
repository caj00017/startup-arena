import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    await clearSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
