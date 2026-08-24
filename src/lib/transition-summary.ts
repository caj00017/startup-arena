type TransitionResult = {
  auctions?: Array<{ status: string } | null>;
  battles?: Array<{ next?: { requiresWildcard?: boolean } | null } | null>;
};

function countLabel(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? "" : "s"}`;
}

export function summarizeTransitionResult(result?: TransitionResult) {
  const auctionResults = (result?.auctions ?? []).filter(
    (auction): auction is { status: string } => Boolean(auction)
  );
  const battleResults = (result?.battles ?? []).filter(Boolean);
  const messages: string[] = [];

  if (auctionResults.length === 0) {
    messages.push("No auctions were due.");
  } else {
    const statusCounts = new Map<string, number>();
    for (const auction of auctionResults) {
      statusCounts.set(auction.status, (statusCounts.get(auction.status) ?? 0) + 1);
    }
    const statuses = [...statusCounts.entries()]
      .map(([status, count]) => `${count} ${status.replaceAll("_", " ")}`)
      .join(", ");
    messages.push(`${countLabel(auctionResults.length, "auction")} processed (${statuses}).`);
  }

  if (battleResults.length === 0) {
    messages.push("No battles were due.");
  } else {
    const wildcardCount = battleResults.filter(
      (battle) => battle?.next?.requiresWildcard
    ).length;
    const suffix = wildcardCount
      ? ` ${countLabel(wildcardCount, "successor")} still requires a wildcard.`
      : "";
    messages.push(`${countLabel(battleResults.length, "battle")} processed.${suffix}`);
  }

  return messages.join(" ");
}
