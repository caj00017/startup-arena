import { StatusPill } from "@/components/ui";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 leading-relaxed sm:py-20">
      <StatusPill tone="accent">Draft for v0.1</StatusPill>
      <h1 className="mt-5 font-display text-6xl font-black tracking-[-0.055em]">Privacy</h1>
      <p className="mt-5 text-[var(--muted)]">Last updated August 24, 2026. This operational draft should be reviewed by counsel before a public commercial launch.</p>
      <div className="mt-10 space-y-8 text-[var(--muted)]">
        <Section title="Information collected">We store the email address used to verify an account; startup information submitted by founders; bids, payment-provider references, votes, and moderation status; and product analytics such as battle impressions, founder referrals, shares, and outbound clicks. We hash IP addresses and user-agent information for abuse prevention rather than storing raw values in the voting record.</Section>
        <Section title="First-party analytics">We use an HTTP-only first-party visitor token for up to eight days to measure unique and returning battle visitors. The server persists only a keyed hash of that random token with analytics events; the token does not contain an email address, startup identity, or advertising identifier.</Section>
        <Section title="How it is used">Information is used to operate battles and auctions, prevent duplicate or automated voting, moderate submissions, settle winning bids, show founders aggregate campaign results, and troubleshoot the service.</Section>
        <Section title="Service providers">A production deployment may use hosting, PostgreSQL, email, payment, bot-protection, and storage providers. Stripe receives payment details directly; Startup Arena stores provider identifiers, not full card numbers.</Section>
        <Section title="Public information">Startup names, descriptions, links, battle records, vote totals, auction bids, and results are public. Founder email addresses and payment details are not public.</Section>
        <Section title="Retention and requests">Operational records are retained while needed for the service, fraud prevention, disputes, and legal obligations. Account access, correction, or deletion requests should be sent to the contact address configured by the operator.</Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-black text-[var(--foreground)]">{title}</h2><p className="mt-2">{children}</p></section>;
}
