import { describe, expect, it } from "vitest";
import {
  determineBattleWinner,
  isAuctionOpen,
  isBattleLive,
  isPublicStartupStatus,
  validateBidAmount
} from "@/lib/domain";

describe("battle rules", () => {
  it("lets the challenger become champion with more votes", () => {
    expect(
      determineBattleWinner({
        championStartupId: "champion",
        challengerStartupId: "challenger",
        championVotes: 12,
        challengerVotes: 13
      })
    ).toBe("challenger");
  });

  it("lets the incumbent retain the title on a tie", () => {
    expect(
      determineBattleWinner({
        championStartupId: "champion",
        challengerStartupId: "challenger",
        championVotes: 12,
        challengerVotes: 12
      })
    ).toBe("champion");
  });

  it("requires the battle to be live and inside its time window", () => {
    const now = new Date("2026-08-21T12:00:00Z");
    expect(
      isBattleLive(
        {
          status: "live",
          startsAt: new Date("2026-08-21T00:00:00Z"),
          endsAt: new Date("2026-08-22T00:00:00Z")
        },
        now
      )
    ).toBe(true);
    expect(
      isBattleLive(
        {
          status: "finalized",
          startsAt: new Date("2026-08-21T00:00:00Z"),
          endsAt: new Date("2026-08-22T00:00:00Z")
        },
        now
      )
    ).toBe(false);
  });
});

describe("auction rules", () => {
  it("accepts the minimum opening bid", () => {
    expect(
      validateBidAmount({
        amountCents: 500,
        minimumBidCents: 500,
        minimumIncrementCents: 100,
        currentHighestBidCents: null
      }).valid
    ).toBe(true);
  });

  it("requires the public minimum increment", () => {
    expect(
      validateBidAmount({
        amountCents: 1_050,
        minimumBidCents: 500,
        minimumIncrementCents: 100,
        currentHighestBidCents: 1_000
      })
    ).toMatchObject({ valid: false });
    expect(
      validateBidAmount({
        amountCents: 1_100,
        minimumBidCents: 500,
        minimumIncrementCents: 100,
        currentHighestBidCents: 1_000
      }).valid
    ).toBe(true);
  });

  it("requires the auction to be open and inside its window", () => {
    expect(
      isAuctionOpen(
        {
          status: "open",
          opensAt: new Date("2026-08-21T00:00:00Z"),
          closesAt: new Date("2026-08-21T23:00:00Z")
        },
        new Date("2026-08-21T12:00:00Z")
      )
    ).toBe(true);
  });

  it("enforces the configured pilot bid cap", () => {
    expect(
      validateBidAmount({
        amountCents: 25_001,
        minimumBidCents: 500,
        minimumIncrementCents: 100,
        currentHighestBidCents: null,
        maximumBidCents: 25_000
      })
    ).toMatchObject({ valid: false });
  });
});

describe("startup visibility", () => {
  it("only exposes approved startups publicly", () => {
    expect(isPublicStartupStatus("approved")).toBe(true);
    expect(isPublicStartupStatus("pending")).toBe(false);
    expect(isPublicStartupStatus("rejected")).toBe(false);
    expect(isPublicStartupStatus("suspended")).toBe(false);
  });
});
