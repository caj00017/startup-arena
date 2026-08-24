import { describe, expect, it } from "vitest";
import {
  buildLeaderboard,
  formatCrownTime,
  type LeaderboardBattle,
  type LeaderboardStartup
} from "@/lib/leaderboard";

const startups: LeaderboardStartup[] = [
  { id: "a", name: "Alpha", slug: "alpha", status: "approved" },
  { id: "b", name: "Beta", slug: "beta", status: "approved" },
  { id: "c", name: "Comet", slug: "comet", status: "approved" },
  { id: "hidden", name: "Hidden", slug: "hidden", status: "suspended" }
];

function battle(input: Partial<LeaderboardBattle> & Pick<LeaderboardBattle, "championStartupId" | "challengerStartupId" | "startsAt" | "endsAt">): LeaderboardBattle {
  return {
    status: "finalized",
    winnerStartupId: input.championStartupId,
    championStreakAtStart: 0,
    finalizedAt: input.endsAt,
    createdAt: input.startsAt,
    ...input
  };
}

describe("leaderboard", () => {
  it("ranks winners by earned defending time and excludes seed and cancelled time", () => {
    const now = new Date("2026-01-04T12:00:00.000Z");
    const rows: LeaderboardBattle[] = [
      battle({
        championStartupId: "a",
        challengerStartupId: "b",
        startsAt: new Date("2026-01-01T00:00:00.000Z"),
        endsAt: new Date("2026-01-02T00:00:00.000Z"),
        winnerStartupId: "b"
      }),
      battle({
        championStartupId: "b",
        challengerStartupId: "c",
        startsAt: new Date("2026-01-02T00:00:00.000Z"),
        endsAt: new Date("2026-01-03T00:00:00.000Z"),
        winnerStartupId: "b",
        championStreakAtStart: 1
      }),
      battle({
        championStartupId: "b",
        challengerStartupId: "a",
        startsAt: new Date("2026-01-03T00:00:00.000Z"),
        endsAt: new Date("2026-01-05T00:00:00.000Z"),
        status: "live",
        winnerStartupId: null,
        championStreakAtStart: 2,
        finalizedAt: null
      }),
      battle({
        championStartupId: "a",
        challengerStartupId: "c",
        startsAt: new Date("2025-12-20T00:00:00.000Z"),
        endsAt: new Date("2025-12-21T00:00:00.000Z"),
        winnerStartupId: "a"
      }),
      battle({
        championStartupId: "c",
        challengerStartupId: "a",
        startsAt: new Date("2025-12-22T00:00:00.000Z"),
        endsAt: new Date("2025-12-23T00:00:00.000Z"),
        winnerStartupId: "c"
      }),
      battle({
        championStartupId: "c",
        challengerStartupId: "a",
        startsAt: new Date("2025-12-23T00:00:00.000Z"),
        endsAt: new Date("2025-12-24T00:00:00.000Z"),
        createdAt: new Date("2025-12-23T04:00:00.000Z"),
        winnerStartupId: "a",
        championStreakAtStart: 1
      }),
      battle({
        championStartupId: "a",
        challengerStartupId: "b",
        startsAt: new Date("2025-12-24T00:00:00.000Z"),
        endsAt: new Date("2025-12-25T00:00:00.000Z"),
        status: "cancelled",
        winnerStartupId: null,
        championStreakAtStart: 1,
        finalizedAt: null
      }),
      battle({
        championStartupId: "hidden",
        challengerStartupId: "a",
        startsAt: new Date("2025-12-10T00:00:00.000Z"),
        endsAt: new Date("2025-12-11T00:00:00.000Z"),
        winnerStartupId: "hidden"
      })
    ];

    const entries = buildLeaderboard(startups, rows, now);

    expect(entries.map((entry) => entry.startup.id)).toEqual(["b", "c", "a"]);
    expect(entries[0]).toMatchObject({
      crownTimeMs: 60 * 60 * 60 * 1000,
      wins: 2,
      longestStreak: 2,
      isCurrentChampion: true
    });
    expect(entries[1]).toMatchObject({
      crownTimeMs: 20 * 60 * 60 * 1000,
      wins: 1,
      longestStreak: 1,
      isCurrentChampion: false
    });
    expect(entries[2]).toMatchObject({
      crownTimeMs: 0,
      wins: 2,
      longestStreak: 1
    });
  });

  it("formats crown time for new, hourly, and daily champions", () => {
    expect(formatCrownTime(0)).toBe("New champion");
    expect(formatCrownTime(90 * 60_000)).toBe("1h 30m");
    expect(formatCrownTime((3 * 24 + 5) * 60 * 60_000)).toBe("3d 5h");
  });
});
