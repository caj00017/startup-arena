import { ArrowRight } from "lucide-react";
import { LinkButton, StatusPill } from "@/components/ui";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <StatusPill tone="accent">Why this exists</StatusPill>
      <h1 className="mt-6 max-w-3xl font-display text-6xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl">Startup advertising should be worth watching.</h1>
      <div className="mt-10 grid gap-8 text-lg leading-relaxed text-[var(--muted)] sm:grid-cols-2">
        <p>Building software has become faster. Finding the first ten, hundred, or thousand users has not. Founders are surrounded by passive directories and ad dashboards that are easy to ignore.</p>
        <p>Startup Arena turns that promotion into a daily contest: two real products, one audience decision, and a transparent auction for who gets to challenge next.</p>
      </div>
      <blockquote className="my-14 border-y-2 border-[var(--foreground)] py-10 text-center font-display text-4xl font-black italic tracking-[-0.04em] sm:text-5xl">“People visit because it’s a game. Founders pay because people visit.”</blockquote>
      <div className="rounded-3xl border-2 border-[var(--foreground)] bg-[var(--brand)] p-8 shadow-hard sm:p-10">
        <h2 className="font-display text-4xl font-black">Money buys entry, not victory.</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-[var(--foreground)]/70">A bid can earn the challenger slot. It cannot buy a vote, change vote weighting, or guarantee a result. Once a startup enters the arena, the audience decides.</p>
        <div className="mt-7 flex flex-wrap gap-3"><LinkButton href="/">See today’s battle <ArrowRight size={16} /></LinkButton><LinkButton href="/submit" className="bg-white text-[var(--foreground)] shadow-[3px_3px_0_var(--accent)]">Submit a startup</LinkButton></div>
      </div>
    </div>
  );
}
