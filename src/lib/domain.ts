export type BattleSide = "champion" | "challenger";

export function determineBattleWinner(input: {
  championStartupId: string;
  challengerStartupId: string;
  championVotes: number;
  challengerVotes: number;
}) {
  return input.challengerVotes > input.championVotes
    ? input.challengerStartupId
    : input.championStartupId;
}

export function validateBidAmount(input: {
  amountCents: number;
  minimumBidCents: number;
  minimumIncrementCents: number;
  currentHighestBidCents: number | null;
}) {
  if (!Number.isSafeInteger(input.amountCents)) {
    return { valid: false as const, reason: "Bid must be a whole number of cents." };
  }

  const floor = input.currentHighestBidCents
    ? input.currentHighestBidCents + input.minimumIncrementCents
    : input.minimumBidCents;

  if (input.amountCents < floor) {
    return { valid: false as const, reason: `Bid must be at least ${floor} cents.` };
  }

  return { valid: true as const, minimumAcceptedCents: floor };
}

export function isBattleLive(
  battle: { status: string; startsAt: Date; endsAt: Date },
  now = new Date()
) {
  return battle.status === "live" && battle.startsAt <= now && battle.endsAt > now;
}

export function isAuctionOpen(
  auction: { status: string; opensAt: Date; closesAt: Date },
  now = new Date()
) {
  return auction.status === "open" && auction.opensAt <= now && auction.closesAt > now;
}
