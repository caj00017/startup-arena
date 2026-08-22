import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { AuctionPanel } from "@/components/auction-panel";
import { BattleArena } from "@/components/battle-arena";
import { Countdown } from "@/components/countdown";
import { ImpressionTracker } from "@/components/impression-tracker";
import { StatusPill } from "@/components/ui";
import { getAccountData, getActiveBattleData } from "@/db/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const data = await getActiveBattleData(user?.id);
  const account = user ? await getAccountData(user.id) : null;

  if (!data) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 text-center">
        <div>
          <StatusPill tone="accent">Arena preparing</StatusPill>
          <h1 className="mt-6 font-display text-6xl font-black tracking-[-0.05em]">The next battle is being lined up.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--muted)]">Check back shortly, or submit your startup for a future challenger auction.</p>
        </div>
      </div>
    );
  }

  const isLive = data.battle.status === "live" && data.battle.endsAt > new Date();

  return (
    <>
      <ImpressionTracker battleId={data.battle.id} />
      <section className="paper-grid border-b border-[var(--line)]">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 text-center sm:pt-16">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <StatusPill tone="live"><span className="live-dot mr-1 size-2 rounded-full bg-[var(--foreground)]" /> Live battle</StatusPill>
            <Countdown target={data.battle.endsAt} />
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
            Two startups. <span className="text-[var(--accent)]">Your call.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] sm:text-xl">
            Explore both products and vote for the one you would rather use. Today’s winner comes back tomorrow.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} /> One verified vote</span>
            <span className="flex items-center gap-1.5"><Sparkles size={15} /> Winner stays on</span>
            <span>Money buys entry, not victory</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        <BattleArena
          battleId={data.battle.id}
          champion={data.champion}
          challenger={data.challenger}
          initialChampionVotes={data.championVotes}
          initialChallengerVotes={data.challengerVotes}
          initialVoteStartupId={data.userVote?.startupId}
          signedIn={Boolean(user)}
          isLive={isLive}
        />

        {data.auction && (
          <div className="mt-14">
            <AuctionPanel
              auction={data.auction}
              publicBids={data.bids.map((item) => ({ ...item.bid, startup: item.startup }))}
              startups={account?.startups ?? []}
              signedIn={Boolean(user)}
              paymentVerified={Boolean(user?.paymentMethodVerifiedAt)}
            />
          </div>
        )}

        <section className="mt-16 border-t-2 border-[var(--foreground)] pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">The record</p>
              <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.04em]">Recent battles</h2>
            </div>
            <Link href="/rules" className="hidden items-center gap-2 text-sm font-black hover:text-[var(--accent)] sm:flex">How it works <ArrowRight size={16} /></Link>
          </div>
          <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {data.recentBattles.length ? data.recentBattles.map(({ battle, champion, challenger }) => {
              const winner = battle.winnerStartupId === champion.id ? champion : challenger;
              const loser = battle.winnerStartupId === champion.id ? challenger : champion;
              const winnerVotes = battle.winnerStartupId === champion.id ? battle.championVotes : battle.challengerVotes;
              const loserVotes = battle.winnerStartupId === champion.id ? battle.challengerVotes : battle.championVotes;
              return (
                <Link href={`/battle/${battle.id}`} key={battle.id} className="flex flex-col gap-2 py-5 hover:text-[var(--accent)] sm:flex-row sm:items-center">
                  <span className="flex-1 font-bold"><strong>{winner.name}</strong> defeated {loser.name}</span>
                  <span className="font-mono text-sm font-black">{winnerVotes}—{loserVotes}</span>
                  <ArrowRight size={17} />
                </Link>
              );
            }) : <p className="py-8 text-center text-sm font-bold text-[var(--muted)]">Today’s winner will write the first line of arena history.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
