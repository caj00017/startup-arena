import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { auctions, battles, startups, users } from "./schema";

config({ path: ".env.local" });
config();

const ids = {
  admin: "00000000-0000-4000-8000-000000000001",
  founderOne: "00000000-0000-4000-8000-000000000002",
  founderTwo: "00000000-0000-4000-8000-000000000003",
  founderThree: "00000000-0000-4000-8000-000000000004",
  founderFour: "00000000-0000-4000-8000-000000000005",
  founderFive: "00000000-0000-4000-8000-000000000006",
  codeCanvas: "10000000-0000-4000-8000-000000000001",
  signalNest: "10000000-0000-4000-8000-000000000002",
  briefKit: "10000000-0000-4000-8000-000000000003",
  launchPad: "10000000-0000-4000-8000-000000000004",
  metricFox: "10000000-0000-4000-8000-000000000005",
  battle: "20000000-0000-4000-8000-000000000001",
  auction: "30000000-0000-4000-8000-000000000001"
};

async function seed() {
  const { db } = await import("./index");
  const now = new Date();

  await db
    .insert(users)
    .values([
      {
        id: ids.admin,
        email: "admin@startuparena.local",
        role: "admin",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_admin"
      },
      {
        id: ids.founderOne,
        email: "maya@codecanvas.example",
        role: "founder",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_codecanvas"
      },
      {
        id: ids.founderTwo,
        email: "leo@signalnest.example",
        role: "founder",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_signalnest"
      },
      {
        id: ids.founderThree,
        email: "nora@briefkit.example",
        role: "founder",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_briefkit"
      },
      {
        id: ids.founderFour,
        email: "sam@launchpad.example",
        role: "founder",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_launchpad"
      },
      {
        id: ids.founderFive,
        email: "ivy@metricfox.example",
        role: "founder",
        emailVerifiedAt: now,
        paymentMethodVerifiedAt: now,
        stripePaymentMethodId: "pm_mock_metricfox"
      }
    ])
    .onConflictDoNothing();

  await db
    .insert(startups)
    .values([
      {
        id: ids.codeCanvas,
        ownerId: ids.founderOne,
        name: "CodeCanvas",
        slug: "codecanvas",
        url: "https://example.com/codecanvas",
        tagline: "Turn rough product ideas into working interfaces in minutes.",
        status: "approved",
        launchStatus: "live",
        safetyConfirmed: true,
        approvedAt: now
      },
      {
        id: ids.signalNest,
        ownerId: ids.founderTwo,
        name: "SignalNest",
        slug: "signalnest",
        url: "https://example.com/signalnest",
        tagline: "A calm, shared inbox for every signal your product sends.",
        status: "approved",
        launchStatus: "beta",
        safetyConfirmed: true,
        approvedAt: now
      },
      {
        id: ids.briefKit,
        ownerId: ids.founderThree,
        name: "BriefKit",
        slug: "briefkit",
        url: "https://example.com/briefkit",
        tagline: "Client briefs that collect the right answers the first time.",
        status: "approved",
        launchStatus: "live",
        safetyConfirmed: true,
        approvedAt: now
      },
      {
        id: ids.launchPad,
        ownerId: ids.founderFour,
        name: "LaunchPad",
        slug: "launchpad",
        url: "https://example.com/launchpad",
        tagline: "Plan and ship a focused product launch without spreadsheet chaos.",
        status: "approved",
        launchStatus: "beta",
        safetyConfirmed: true,
        approvedAt: now
      },
      {
        id: ids.metricFox,
        ownerId: ids.founderFive,
        name: "MetricFox",
        slug: "metricfox",
        url: "https://example.com/metricfox",
        tagline: "Simple product analytics for teams that refuse dashboard sprawl.",
        status: "approved",
        launchStatus: "waitlist",
        safetyConfirmed: true,
        approvedAt: now
      }
    ])
    .onConflictDoNothing();

  const existingBattle = await db
    .select({ id: battles.id })
    .from(battles)
    .where(eq(battles.id, ids.battle))
    .limit(1);

  if (existingBattle.length === 0) {
    const startsAt = new Date(now.getTime() - 60 * 60 * 1000);
    const endsAt = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const closesAt = new Date(endsAt.getTime() - 60 * 60 * 1000);

    await db.insert(battles).values({
      id: ids.battle,
      championStartupId: ids.codeCanvas,
      challengerStartupId: ids.signalNest,
      startsAt,
      endsAt,
      status: "live",
      championStreakAtStart: 3
    });

    await db.insert(auctions).values({
      id: ids.auction,
      battleId: ids.battle,
      opensAt: startsAt,
      closesAt,
      status: "open",
      minimumBidCents: 500,
      minimumIncrementCents: 100,
      wildcardStartupId: ids.briefKit
    });
  }

  console.log("Seed complete.");
  console.log("Development sign-in: admin@startuparena.local");
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
