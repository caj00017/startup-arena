import type { Battle, Startup } from "@/db/schema";

export type LeaderboardBattle = Pick<
  Battle,
  | "championStartupId"
  | "challengerStartupId"
  | "startsAt"
  | "endsAt"
  | "status"
  | "winnerStartupId"
  | "championStreakAtStart"
  | "finalizedAt"
  | "createdAt"
>;

export type LeaderboardStartup = Pick<Startup, "id" | "name" | "slug" | "status">;

export type LeaderboardEntry = {
  startup: LeaderboardStartup;
  crownTimeMs: number;
  wins: number;
  longestStreak: number;
  firstWinAt: Date;
  isCurrentChampion: boolean;
};

const crownStatuses = new Set<Battle["status"]>([
  "live",
  "paused",
  "ended",
  "validating",
  "finalized"
]);

export function buildLeaderboard(
  startupRows: LeaderboardStartup[],
  battleRows: LeaderboardBattle[],
  now = new Date()
) {
  const winners = new Map<
    string,
    { wins: number; longestStreak: number; firstWinAt: Date }
  >();

  for (const battle of battleRows) {
    if (battle.status !== "finalized" || !battle.winnerStartupId) continue;
    const prior = winners.get(battle.winnerStartupId);
    const resultingStreak =
      battle.winnerStartupId === battle.championStartupId
        ? battle.championStreakAtStart + 1
        : 1;
    const wonAt = battle.finalizedAt ?? battle.endsAt;
    winners.set(battle.winnerStartupId, {
      wins: (prior?.wins ?? 0) + 1,
      longestStreak: Math.max(prior?.longestStreak ?? 0, resultingStreak),
      firstWinAt:
        prior && prior.firstWinAt < wonAt ? prior.firstWinAt : wonAt
    });
  }

  const crownTimeByStartup = new Map<string, number>();
  for (const battle of battleRows) {
    if (
      battle.championStreakAtStart < 1 ||
      !winners.has(battle.championStartupId) ||
      !crownStatuses.has(battle.status)
    ) {
      continue;
    }

    const intervalStart = Math.max(
      battle.startsAt.getTime(),
      battle.createdAt.getTime()
    );
    const intervalEnd = Math.min(battle.endsAt.getTime(), now.getTime());
    if (intervalEnd <= intervalStart) continue;
    crownTimeByStartup.set(
      battle.championStartupId,
      (crownTimeByStartup.get(battle.championStartupId) ?? 0) +
        (intervalEnd - intervalStart)
    );
  }

  const currentBattle = battleRows
    .filter(
      (battle) =>
        ["live", "paused"].includes(battle.status) &&
        battle.startsAt <= now &&
        battle.endsAt > now
    )
    .sort((left, right) => right.startsAt.getTime() - left.startsAt.getTime())[0];

  const startupById = new Map(startupRows.map((startup) => [startup.id, startup]));
  return [...winners.entries()]
    .flatMap(([startupId, result]) => {
      const startup = startupById.get(startupId);
      if (!startup || startup.status !== "approved") return [];
      return [{
        startup,
        crownTimeMs: crownTimeByStartup.get(startupId) ?? 0,
        wins: result.wins,
        longestStreak: result.longestStreak,
        firstWinAt: result.firstWinAt,
        isCurrentChampion: currentBattle?.championStartupId === startupId
      } satisfies LeaderboardEntry];
    })
    .sort(
      (left, right) =>
        right.crownTimeMs - left.crownTimeMs ||
        right.wins - left.wins ||
        right.longestStreak - left.longestStreak ||
        left.firstWinAt.getTime() - right.firstWinAt.getTime() ||
        left.startup.name.localeCompare(right.startup.name)
    );
}

export function formatCrownTime(durationMs: number) {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return totalMinutes > 0 ? `${totalMinutes}m` : "New champion";
}
