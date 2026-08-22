import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { createPaymentSetup } from "@/lib/payments";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const result = await createPaymentSetup(user);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
