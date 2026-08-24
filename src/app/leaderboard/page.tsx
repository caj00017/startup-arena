import Link from "next/link";
import { Clock3, Crown, Flame, Trophy } from "lucide-react";
import { StartupMark } from "@/components/startup-mark";
import { StatusPill } from "@/components/ui";
import { getLeaderboardData } from "@/db/queries";
import { formatCrownTime } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leaderboard" };

export default async function LeaderboardPage() {
  const entries = await getLeaderboardData();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <div className="max-w-3xl">
        <StatusPill tone="accent"><Trophy size={14} className="mr-1.5" /> Hall of champions</StatusPill>
        <h1 className="mt-5 font-display text-6xl font-black tracking-[-0.055em] sm:text-7xl">
          Who held the crown longest?
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">
          Crown time is the cumulative time a winner returns as defending champion. Only actual arena time counts; cancelled matchups and downtime before the next battle are excluded.
        </p>
      </div>

      {entries.length > 0 ? (
        <div className="mt-12 overflow-hidden rounded-3xl border-2 border-[var(--foreground)] bg-[var(--paper)] shadow-hard">
          <div className="hidden grid-cols-[70px_minmax(260px,1fr)_150px_100px_130px] gap-4 border-b-2 border-[var(--foreground)] bg-[var(--brand-soft)] px-6 py-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)] md:grid">
            <span>Rank</span><span>Startup</span><span>Crown time</span><span>Wins</span><span>Best streak</span>
          </div>
          <ol className="divide-y divide-[var(--line)]">
            {entries.map((entry, index) => (
              <li key={entry.startup.id}>
                <Link
                  href={`/startup/${entry.startup.slug}`}
                  className="grid gap-5 px-5 py-6 hover:bg-[#edf3fa] md:grid-cols-[70px_minmax(260px,1fr)_150px_100px_130px] md:items-center md:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl font-black">#{index + 1}</span>
                    {index === 0 && <Crown size={21} className="text-[var(--accent)]" aria-label="First place" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <StartupMark name={entry.startup.name} />
                    <div>
                      <p className="text-xl font-black">{entry.startup.name}</p>
                      {entry.isCurrentChampion && <StatusPill tone="live">Current champion</StatusPill>}
                    </div>
                  </div>
                  <Metric icon={<Clock3 size={17} />} label="Crown time" value={formatCrownTime(entry.crownTimeMs)} />
                  <Metric icon={<Trophy size={17} />} label="Wins" value={entry.wins} />
                  <Metric icon={<Flame size={17} />} label="Best streak" value={`${entry.longestStreak} win${entry.longestStreak === 1 ? "" : "s"}`} />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="mt-12 rounded-3xl border-2 border-dashed border-[var(--line)] bg-[var(--paper)] p-12 text-center">
          <Trophy size={34} className="mx-auto text-[var(--muted)]" />
          <h2 className="mt-4 text-xl font-black">The board opens after the first final result.</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">Every startup with at least one verified battle win will appear here.</p>
        </div>
      )}

      <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
        A startup enters the leaderboard after its first finalized win. Crown time starts when it returns in the next matchup as defending champion. Ties are broken by total wins, best winning streak, and then earliest first win.
      </p>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)] md:hidden">{icon}{label}</p>
      <p className="mt-1 font-mono text-lg font-black md:mt-0">{value}</p>
    </div>
  );
}
