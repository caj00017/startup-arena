import { ArrowUpRight, MousePointerClick, Swords, Trophy } from "lucide-react";
import { notFound } from "next/navigation";
import { StartupMark } from "@/components/startup-mark";
import { StatusPill } from "@/components/ui";
import { getStartupProfile } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getStartupProfile(slug);
  if (!data || data.startup.status === "suspended") notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <div className="flex flex-col gap-6 border-b-2 border-[var(--foreground)] pb-10 sm:flex-row sm:items-center">
        <StartupMark name={data.startup.name} className="size-20 text-3xl" />
        <div className="flex-1"><div className="flex flex-wrap gap-2"><StatusPill tone="good">{data.startup.status}</StatusPill><StatusPill>{data.startup.launchStatus}</StatusPill></div><h1 className="mt-3 font-display text-6xl font-black tracking-[-0.055em]">{data.startup.name}</h1><p className="mt-3 text-lg text-[var(--muted)]">{data.startup.tagline}</p></div>
        <a href={`/go/${data.startup.id}`} target="_blank" rel="noopener sponsored" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] px-5 text-sm font-black text-white">Visit startup <ArrowUpRight size={17} /></a>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <Stat icon={<Trophy size={19} />} value={data.wins} label="Wins" />
        <Stat icon={<Swords size={19} />} value={data.wins + data.losses} label="Battles" />
        <Stat icon={<MousePointerClick size={19} />} value={data.clicks} label="Clicks" />
      </div>
      <section className="mt-12"><h2 className="font-display text-4xl font-black tracking-[-0.04em]">Battle record</h2><div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">{data.battles.length ? data.battles.map(({ battle, opponent }) => <a href={`/battle/${battle.id}`} key={battle.id} className="flex items-center gap-4 py-5 hover:text-[var(--accent)]"><span className="font-black">{battle.winnerStartupId === data.startup.id ? "WIN" : "LOSS"}</span><span className="flex-1">vs. {opponent.name}</span><span className="font-mono text-sm font-bold">{battle.championVotes}—{battle.challengerVotes}</span></a>) : <p className="py-8 text-center text-[var(--muted)]">No completed battles yet.</p>}</div></section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-4 shadow-hard-sm sm:p-5"><div className="flex items-center gap-2 text-[var(--muted)]">{icon}<span className="hidden text-sm font-bold sm:inline">{label}</span></div><p className="mt-3 font-display text-4xl font-black">{value}</p><p className="text-xs font-bold text-[var(--muted)] sm:hidden">{label}</p></div>;
}
