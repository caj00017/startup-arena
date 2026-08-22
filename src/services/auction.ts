import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, auctions, battles, bids, startups, users } from "@/db/schema";
import { isAuctionOpen, validateBidAmount } from "@/lib/domain";

export class AuctionError extends Error {}

export async function placeBid(input: {
  auctionId: string;
  startupId: string;
  userId: string;
  amountCents: number;
}) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select id from ${auctions} where id = ${input.auctionId} for update`);

    const [auctionRow] = await tx
      .select({ auction: auctions, battle: battles })
      .from(auctions)
      .innerJoin(battles, eq(battles.id, auctions.battleId))
      .where(eq(auctions.id, input.auctionId))
      .limit(1);

    if (!auctionRow || !isAuctionOpen(auctionRow.auction)) {
      throw new AuctionError("This auction is no longer accepting bids.");
    }

    const [startup] = await tx
      .select()
      .from(startups)
      .where(and(eq(startups.id, input.startupId), eq(startups.ownerId, input.userId)))
      .limit(1);
    if (!startup || startup.status !== "approved") {
      throw new AuctionError("Only your approved startup can enter this auction.");
    }

    if (
      startup.id === auctionRow.battle.championStartupId ||
      startup.id === auctionRow.battle.challengerStartupId
    ) {
      throw new AuctionError("A startup already in today's battle cannot bid for tomorrow.");
    }

    const [user] = await tx.select().from(users).where(eq(users.id, input.userId)).limit(1);
    if (!user?.paymentMethodVerifiedAt || !user.stripePaymentMethodId) {
      throw new AuctionError("Verify a payment method before placing a bid.");
    }

    const [highest] = await tx
      .select({ amountCents: bids.amountCents })
      .from(bids)
      .where(
        and(
          eq(bids.auctionId, input.auctionId),
          inArray(bids.status, ["valid", "outbid", "winning"])
        )
      )
      .orderBy(desc(bids.amountCents), asc(bids.createdAt))
      .limit(1);

    const validation = validateBidAmount({
      amountCents: input.amountCents,
      minimumBidCents: auctionRow.auction.minimumBidCents,
      minimumIncrementCents: auctionRow.auction.minimumIncrementCents,
      currentHighestBidCents: highest?.amountCents ?? null
    });
    if (!validation.valid) throw new AuctionError(validation.reason);

    await tx
      .update(bids)
      .set({ status: "outbid", updatedAt: new Date() })
      .where(and(eq(bids.auctionId, input.auctionId), eq(bids.status, "valid")));

    const [bid] = await tx
      .insert(bids)
      .values({
        auctionId: input.auctionId,
        startupId: input.startupId,
        userId: input.userId,
        amountCents: input.amountCents,
        status: "valid",
        paymentStatus: "authorized"
      })
      .returning();

    await tx.insert(auditLogs).values({
      actorUserId: input.userId,
      action: "bid.placed",
      entityType: "bid",
      entityId: bid.id,
      metadata: { auctionId: input.auctionId, amountCents: input.amountCents }
    });

    return bid;
  });
}
