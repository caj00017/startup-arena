import { notFound } from "next/navigation";
import { BattleArena } from "@/components/battle-arena";
import { StatusPill } from "@/components/ui";
import { getBattleData } from "@/db/queries";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function BattlePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const data = await getBattleData(id, user?.id);
  if (!data) notFound();
  const live = data.battle.status === "live" && data.battle.endsAt > new Date();
  const winner = data.battle.winnerStartupId === data.champion.id ? data.champion : data.challenger;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="mb-10 text-center">
        <StatusPill tone={live ? "live" : "neutral"}>{live ? "Live battle" : "Final result"}</StatusPill>
        <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.05em]">{live ? "The fight is still live." : `${winner.name} won the day.`}</h1>
        <p className="mt-3 text-sm font-bold text-[var(--muted)]">{data.battle.startsAt.toLocaleString("en-US", { dateStyle: "long", timeZone: "UTC" })} · UTC</p>
      </div>
      <BattleArena
        battleId={data.battle.id}
        champion={data.champion}
        challenger={data.challenger}
        initialChampionVotes={data.championVotes}
        initialChallengerVotes={data.challengerVotes}
        initialVoteStartupId={data.userVote?.startupId}
        signedIn={Boolean(user)}
        isLive={live}
        turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
    </div>
  );
}
