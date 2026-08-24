import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { createPaymentSetup, paymentProviderErrorDetails } from "@/lib/payments";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    try {
      const result = await createPaymentSetup(user);
      return NextResponse.json(result);
    } catch (error) {
      console.error("Stripe payment setup failed", paymentProviderErrorDetails(error));
      return NextResponse.json(
        { error: "Payment setup is temporarily unavailable. Contact support." },
        { status: 502 }
      );
    }
  } catch (error) {
    return jsonError(error);
  }
}
