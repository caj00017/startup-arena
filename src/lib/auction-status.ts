export function auctionUnavailableMessage(status: string) {
  switch (status) {
    case "paused":
      return "Bidding is temporarily paused by the arena operator.";
    case "awarded":
      return "This auction has closed and the next challenger has been selected.";
    case "no_bid":
      return "This auction closed without a payable bid. The reviewed fallback will be used.";
    case "cancelled":
      return "This auction was cancelled.";
    case "open":
      return "This auction has closed and is awaiting settlement.";
    default:
      return "This auction is settling. The next one opens with tomorrow’s battle.";
  }
}
