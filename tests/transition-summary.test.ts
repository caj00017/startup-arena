import { describe, expect, it } from "vitest";
import { summarizeTransitionResult } from "@/lib/transition-summary";

describe("operator transition summaries", () => {
  it("reports the awarded auction instead of a generic success", () => {
    expect(
      summarizeTransitionResult({
        auctions: [{ status: "awarded" }],
        battles: []
      })
    ).toBe("1 auction processed (1 awarded). No battles were due.");
  });

  it("distinguishes an idempotent run with nothing due", () => {
    expect(summarizeTransitionResult({ auctions: [], battles: [] })).toBe(
      "No auctions were due. No battles were due."
    );
  });

  it("calls out finalized battles that still need a wildcard", () => {
    expect(
      summarizeTransitionResult({
        auctions: [],
        battles: [{ next: { requiresWildcard: true } }]
      })
    ).toBe(
      "No auctions were due. 1 battle processed. 1 successor still requires a wildcard."
    );
  });
});
