import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { bids, webhookEvents } from "@/db/schema";
import { completePaymentSetup, constructStripeEvent } from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(await request.text(), signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook." },
      { status: 400 }
    );
  }

  const [alreadyProcessed] = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(eq(webhookEvents.id, event.id))
    .limit(1);
  if (alreadyProcessed) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.arenaUserId;
    if (userId) await completePaymentSetup(userId, session.id);
  }

  if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
    const intent = event.data.object;
    const bidId = intent.metadata.arenaBidId;
    if (bidId) {
      await db
        .update(bids)
        .set({
          paymentStatus: event.type === "payment_intent.succeeded" ? "captured" : "failed",
          paymentReference: intent.id,
          updatedAt: new Date()
        })
        .where(eq(bids.id, bidId));
    }
  }

  await db.insert(webhookEvents).values({ id: event.id, eventType: event.type });
  return NextResponse.json({ received: true });
}
