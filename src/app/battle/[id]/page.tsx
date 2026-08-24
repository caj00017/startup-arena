import { notFound } from "next/navigation";
import { BattleArena } from "@/components/battle-arena";
import { ImpressionTracker } from "@/components/impression-tracker";
import { StatusPill } from "@/components/ui";
import { getBattleData, getOwnedStartupIds } from "@/db/queries";
import { createFounderReferralCode, parseFounderReferralCode } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function BattlePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser()
  ]);
  const [data, ownedStartupIds] = await Promise.all([
    getBattleData(id, user?.id),
    user ? getOwnedStartupIds(user.id) : Promise.resolve([])
  ]);
  if (!data) notFound();
  const live = data.battle.status === "live" && data.battle.endsAt > new Date();
  const winner = data.battle.winnerStartupId === data.champion.id ? data.champion : data.challenger;
  const referralCode = typeof query.ref === "string" ? query.ref : undefined;
  const referral = parseFounderReferralCode(referralCode);
  const acceptedReferralCode =
    referral?.battleId === data.battle.id &&
    [data.champion.id, data.challenger.id].includes(referral.startupId)
      ? referralCode
      : undefined;
  const founderReferralCodes = live
    ? Object.fromEntries(
        ownedStartupIds
          .filter((startupId) => [data.champion.id, data.challenger.id].includes(startupId))
          .map((startupId) => [
            startupId,
            createFounderReferralCode(data.battle.id, startupId)
          ])
      )
    : {};

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <ImpressionTracker
        battleId={data.battle.id}
        referralCode={acceptedReferralCode}
      />
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
        founderReferralCodes={founderReferralCodes}
      />
    </div>
  );
}
