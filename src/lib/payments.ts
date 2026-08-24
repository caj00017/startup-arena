import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type Bid, type User } from "@/db/schema";
import { env } from "./env";

let stripeClient: Stripe | null = null;

function stripe() {
  if (!env.STRIPE_SECRET_KEY) return null;
  stripeClient ||= new Stripe(env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export function isMockPaymentMode() {
  return !env.STRIPE_SECRET_KEY;
}

export function buildPaymentSetupSessionParams(input: {
  customerId: string;
  userId: string;
}): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "setup",
    currency: "usd",
    customer: input.customerId,
    success_url: `${env.NEXT_PUBLIC_APP_URL}/api/payments/setup/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/account?payment=cancelled`,
    metadata: { arenaUserId: input.userId }
  };
}

export async function createPaymentSetup(user: User) {
  const client = stripe();

  if (!client) {
    if (env.NODE_ENV === "production") {
      throw new Error("Stripe must be configured before accepting production bids.");
    }
    await db
      .update(users)
      .set({
        stripePaymentMethodId: `pm_mock_${user.id}`,
        paymentMethodVerifiedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    return { url: "/account?payment=verified&mode=mock", mock: true as const };
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create(
      { email: user.email, metadata: { arenaUserId: user.id } },
      { idempotencyKey: `arena-customer-${user.id}` }
    );
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  const session = await client.checkout.sessions.create(
    buildPaymentSetupSessionParams({ customerId, userId: user.id })
  );

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url, mock: false as const };
}

export async function completePaymentSetup(userId: string, sessionId: string) {
  const client = stripe();
  if (!client) return;

  const session = await client.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.arenaUserId !== userId || !session.setup_intent) {
    throw new Error("Payment setup session does not belong to this user.");
  }

  const setupIntentId =
    typeof session.setup_intent === "string" ? session.setup_intent : session.setup_intent.id;
  const setupIntent = await client.setupIntents.retrieve(setupIntentId);
  const paymentMethodId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent.payment_method?.id;

  if (!paymentMethodId || setupIntent.status !== "succeeded") {
    throw new Error("Payment method verification is incomplete.");
  }

  await db
    .update(users)
    .set({
      stripePaymentMethodId: paymentMethodId,
      paymentMethodVerifiedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));
}

export async function captureWinningBid(bid: Bid, user: User) {
  const client = stripe();

  if (!client) {
    if (env.NODE_ENV === "production") {
      return { succeeded: false as const, reason: "Stripe is not configured." };
    }
    return { succeeded: true as const, reference: `mock_charge_${bid.id}` };
  }

  if (!user.stripeCustomerId || !user.stripePaymentMethodId) {
    return { succeeded: false as const, reason: "No verified payment method." };
  }

  try {
    const intent = await client.paymentIntents.create(
      {
        amount: bid.amountCents,
        currency: "usd",
        customer: user.stripeCustomerId,
        payment_method: user.stripePaymentMethodId,
        confirm: true,
        off_session: true,
        description: "Startup Arena challenger slot",
        metadata: { arenaBidId: bid.id, arenaAuctionId: bid.auctionId }
      },
      { idempotencyKey: `arena-capture-${bid.id}` }
    );

    return intent.status === "succeeded"
      ? { succeeded: true as const, reference: intent.id }
      : { succeeded: false as const, reason: `Payment status: ${intent.status}` };
  } catch (error) {
    return {
      succeeded: false as const,
      reason: error instanceof Error ? error.message : "Payment failed."
    };
  }
}

export async function refundPayment(reference: string) {
  const client = stripe();
  if (!client || reference.startsWith("mock_charge_")) {
    return { succeeded: true as const, reference: `mock_refund_${reference}` };
  }

  const refund = await client.refunds.create(
    { payment_intent: reference },
    { idempotencyKey: `arena-refund-${reference}` }
  );
  return { succeeded: refund.status === "succeeded", reference: refund.id };
}

export function constructStripeEvent(payload: string, signature: string) {
  const client = stripe();
  if (!client || !env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook handling is not configured.");
  }
  return client.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
