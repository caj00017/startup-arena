"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Crown, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, StatusPill } from "./ui";
import { StartupMark } from "./startup-mark";
import { percentage } from "@/lib/utils";
import { Turnstile } from "./turnstile";

type StartupCardData = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  launchStatus: string;
};

export function BattleArena({
  battleId,
  champion,
  challenger,
  initialChampionVotes,
  initialChallengerVotes,
  initialVoteStartupId,
  signedIn,
  isLive,
  turnstileSiteKey
}: {
  battleId: string;
  champion: StartupCardData;
  challenger: StartupCardData;
  initialChampionVotes: number;
  initialChallengerVotes: number;
  initialVoteStartupId?: string | null;
  signedIn: boolean;
  isLive: boolean;
  turnstileSiteKey?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialVoteStartupId || null);
  const [championVotes, setChampionVotes] = useState(initialChampionVotes);
  const [challengerVotes, setChallengerVotes] = useState(initialChallengerVotes);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  async function vote(startupId: string) {
    if (!signedIn) {
      router.push(`/signin?next=${encodeURIComponent("/")}`);
      return;
    }
    if (selected || !isLive) return;
    setPending(startupId);
    setError("");

    const response = await fetch("/api/votes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ battleId, startupId, turnstileToken: turnstileToken || undefined })
    });
    const result = (await response.json()) as {
      error?: string;
      championVotes?: number;
      challengerVotes?: number;
    };
    setPending(null);
    if (!response.ok) {
      setError(result.error || "Your vote could not be recorded.");
      if (turnstileSiteKey) setTurnstileReset((value) => value + 1);
      return;
    }
    setSelected(startupId);
    setChampionVotes(result.championVotes ?? championVotes);
    setChallengerVotes(result.challengerVotes ?? challengerVotes);
    router.refresh();
  }

  const total = championVotes + challengerVotes;
  const showResults = Boolean(selected) || !isLive;
  const championPercent = percentage(championVotes, total);
  const challengerPercent = total === 0 ? 50 : 100 - championPercent;
  const waitingForVerification = Boolean(signedIn && turnstileSiteKey && !turnstileToken);

  return (
    <section aria-labelledby="battle-heading">
      <div className="relative grid gap-4 lg:grid-cols-[1fr_84px_1fr] lg:items-stretch">
        <StartupCard
          startup={champion}
          label="Defending champion"
          icon={<Crown size={15} />}
          side="champion"
          selected={selected === champion.id}
          pending={pending === champion.id}
          disabled={Boolean(selected) || !isLive || waitingForVerification}
          onVote={() => vote(champion.id)}
          battleId={battleId}
        />

        <div className="z-10 flex items-center justify-center lg:flex-col">
          <span className="grid size-14 place-items-center rounded-full border-2 border-[var(--foreground)] bg-[var(--brand)] font-display text-2xl font-black italic text-white shadow-hard-sm lg:size-16">
            VS
          </span>
        </div>

        <StartupCard
          startup={challenger}
          label="Today’s challenger"
          icon={<Swords size={15} />}
          side="challenger"
          selected={selected === challenger.id}
          pending={pending === challenger.id}
          disabled={Boolean(selected) || !isLive || waitingForVerification}
          onVote={() => vote(challenger.id)}
          battleId={battleId}
        />
      </div>

      {signedIn && isLive && !selected && (
        <div className="mt-5 flex justify-center">
          <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} resetKey={turnstileReset} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-4 shadow-hard-sm sm:p-5">
        {showResults ? (
          <>
            <div className="mb-3 flex items-end justify-between gap-4 font-black">
              <span>{champion.name} {championPercent}%</span>
              <span>{challengerPercent}% {challenger.name}</span>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full border-2 border-[var(--foreground)] bg-white">
              <div className="bg-[var(--brand-deep)] transition-all" style={{ width: `${championPercent}%` }} />
              <div className="bg-[var(--foreground)] transition-all" style={{ width: `${challengerPercent}%` }} />
            </div>
            <p className="mt-3 text-center text-xs font-bold text-[var(--muted)]">
              {total} verified {total === 1 ? "vote" : "votes"} · Results update after each vote
            </p>
          </>
        ) : (
          <p className="text-center text-sm font-bold text-[var(--muted)]">
            Vote to reveal the live result. Money buys entry—not votes.
          </p>
        )}
      </div>
      {error && <p role="alert" className="mt-4 text-center text-sm font-bold text-red-700">{error}</p>}
    </section>
  );
}

function StartupCard({
  startup,
  label,
  icon,
  side,
  selected,
  pending,
  disabled,
  onVote,
  battleId
}: {
  startup: StartupCardData;
  label: string;
  icon: React.ReactNode;
  side: "champion" | "challenger";
  selected: boolean;
  pending: boolean;
  disabled: boolean;
  onVote: () => void;
  battleId: string;
}) {
  return (
    <article className="card-lift flex min-h-[370px] flex-col rounded-3xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard sm:p-7">
      <div className="mb-8 flex items-start justify-between gap-3">
        <StartupMark name={startup.name} />
        <StatusPill tone={side === "champion" ? "accent" : "neutral"}>
          {icon}{label}
        </StatusPill>
      </div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
        {startup.launchStatus}
      </p>
      <h2 className="font-display text-4xl font-black tracking-[-0.04em] sm:text-5xl">{startup.name}</h2>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-[var(--muted)]">{startup.tagline}</p>
      <div className="mt-auto grid gap-3 pt-8 sm:grid-cols-2">
        <a
          href={`/go/${startup.id}?battle=${battleId}`}
          target="_blank"
          rel="noopener sponsored"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-white px-4 text-sm font-black hover:bg-[#edf3fa]"
        >
          Visit <ArrowUpRight size={17} />
        </a>
        <Button
          type="button"
          onClick={onVote}
          disabled={disabled || pending}
          className={side === "challenger" ? "shadow-[3px_3px_0_var(--brand-deep)]" : ""}
        >
          {selected ? <><Check size={17} /> Your pick</> : pending ? "Recording…" : `Vote ${startup.name}`}
        </Button>
      </div>
    </article>
  );
}
