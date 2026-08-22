import { Gavel, ShieldCheck, Swords, Trophy } from "lucide-react";
import { StatusPill } from "@/components/ui";

export const metadata = { title: "Rules" };

const rules = [
  { icon: Swords, title: "One daily battle", copy: "The defending champion faces the founder who won the previous challenger auction. Each battle lasts 24 hours." },
  { icon: ShieldCheck, title: "One verified vote", copy: "A verified account may vote once per battle. Campaigning is welcome; automation, purchased votes, and vote farms are not." },
  { icon: Trophy, title: "Winner stays on", copy: "The startup with the most valid votes becomes champion. A tie goes to the incumbent champion. Champions return without paying again." },
  { icon: Gavel, title: "Highest bid challenges", copy: "Approved founders bid publicly for tomorrow’s challenger slot. The highest valid bidder pays their bid; everyone else pays nothing." }
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14 sm:py-20">
      <StatusPill tone="accent">Public rulebook</StatusPill>
      <h1 className="mt-6 font-display text-6xl font-black tracking-[-0.055em] sm:text-7xl">Fair fights, clear stakes.</h1>
      <p className="mt-5 max-w-2xl text-xl leading-relaxed text-[var(--muted)]">Founders purchase attention. The audience decides the outcome. Those two things never mix.</p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {rules.map(({ icon: Icon, title, copy }) => (
          <article key={title} className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-6 shadow-hard-sm">
            <Icon size={26} />
            <h2 className="mt-5 text-xl font-black">{title}</h2>
            <p className="mt-2 leading-relaxed text-[var(--muted)]">{copy}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 space-y-9 border-t-2 border-[var(--foreground)] pt-9 leading-relaxed">
        <section><h2 className="text-2xl font-black">Auction and payment</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted)]"><li>The minimum opening bid is $5 and each new bid must exceed the leader by at least $1.</li><li>A verified payment method is required before a bid is accepted.</li><li>The winner is charged after the auction closes. If payment fails, the next-highest valid bidder is considered.</li><li>A winning payment is final after the battle slot is scheduled. If Startup Arena cancels the battle, the payment is refunded.</li></ul></section>
        <section><h2 className="text-2xl font-black">Voting integrity</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-[var(--muted)]"><li>Results are hidden until a voter casts their vote.</li><li>Suspicious votes may be reviewed or invalidated before finalization.</li><li>Founders may share their battle publicly, but may not automate or purchase votes.</li><li>Results represent preference within a Startup Arena matchup—not an objective judgment of company quality.</li></ul></section>
        <section><h2 className="text-2xl font-black">Listings and safety</h2><p className="mt-3 text-[var(--muted)]">We may reject or remove scams, malware, illegal products, adult content, impersonation, broken products, or submissions that cannot be presented fairly. Founders may request a review of a moderation decision.</p></section>
      </div>
    </div>
  );
}
