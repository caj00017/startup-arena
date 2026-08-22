import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { completePaymentSetup } from "@/lib/payments";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/signin?next=/account", env.NEXT_PUBLIC_APP_URL));
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(new URL("/account?payment=failed", env.NEXT_PUBLIC_APP_URL));
  try {
    await completePaymentSetup(user.id, sessionId);
    return NextResponse.redirect(new URL("/account?payment=verified", env.NEXT_PUBLIC_APP_URL));
  } catch {
    return NextResponse.redirect(new URL("/account?payment=failed", env.NEXT_PUBLIC_APP_URL));
  }
}
