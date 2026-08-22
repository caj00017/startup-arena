import { StatusPill } from "@/components/ui";

export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 leading-relaxed sm:py-20">
      <StatusPill tone="accent">Draft for v0.1</StatusPill>
      <h1 className="mt-5 font-display text-6xl font-black tracking-[-0.055em]">Terms</h1>
      <p className="mt-5 text-[var(--muted)]">Last updated August 21, 2026. This operational draft is not legal advice and requires counsel before launch.</p>
      <div className="mt-10 space-y-8 text-[var(--muted)]">
        <Section title="What a winning bid purchases">A winning bidder purchases a promotional challenger placement in a specified Startup Arena battle. A bid does not purchase votes, favorable treatment, a victory, conversions, or a minimum amount of traffic.</Section>
        <Section title="Charges and refunds">Losing bidders are not charged. The winning bid is charged after auction close. Winning payments are final once the battle is scheduled, except that Startup Arena will refund a placement it cancels and does not deliver.</Section>
        <Section title="Voting and campaigns">Founders may share a battle and ask people to participate. Automated votes, paid vote farms, impersonation, multiple accounts used to evade voting limits, or interference with another participant are prohibited. Suspicious votes may be reviewed or removed.</Section>
        <Section title="Listings">Founders must have authority to submit the product and its assets. Startup Arena may reject or remove unsafe, deceptive, illegal, infringing, adult, broken, or unfairly presented submissions.</Section>
        <Section title="Availability and disputes">The service may be paused to protect users, repair a transition, investigate fraud, or comply with law. The operator should add governing-law, liability, dispute, and contact provisions with qualified counsel before accepting public payments.</Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-black text-[var(--foreground)]">{title}</h2><p className="mt-2">{children}</p></section>;
}
