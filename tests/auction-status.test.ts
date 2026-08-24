import { describe, expect, it } from "vitest";
import { auctionUnavailableMessage } from "@/lib/auction-status";

describe("public auction status messages", () => {
  it("distinguishes an operator pause from settlement", () => {
    expect(auctionUnavailableMessage("paused")).toBe(
      "Bidding is temporarily paused by the arena operator."
    );
    expect(auctionUnavailableMessage("settling")).toContain("settling");
  });

  it("explains terminal auction outcomes", () => {
    expect(auctionUnavailableMessage("awarded")).toContain("challenger has been selected");
    expect(auctionUnavailableMessage("no_bid")).toContain("reviewed fallback");
    expect(auctionUnavailableMessage("cancelled")).toContain("cancelled");
  });
});
