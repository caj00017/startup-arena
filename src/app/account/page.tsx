import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, CreditCard, MousePointerClick } from "lucide-react";
import { AccountActions } from "@/components/account-actions";
import { StartupMark } from "@/components/startup-mark";
import { LinkButton, StatusPill } from "@/components/ui";
import { getAccountData } from "@/db/queries";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const data = await getAccountData(user.id);
  const counts = new Map(data.events.map((row) => [`${row.startupId}:${row.type}`, Number(row.total)]));

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <div className="flex flex-col gap-6 border-b-2 border-[var(--foreground)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <StatusPill tone={user.paymentMethodVerifiedAt ? "good" : "neutral"}>{user.role}</StatusPill>
          <h1 className="mt-4 font-display text-5xl font-black tracking-[-0.05em]">Your corner</h1>
          <p className="mt-2 text-[var(--muted)]">{user.email}</p>
        </div>
        <AccountActions paymentVerified={Boolean(user.paymentMethodVerifiedAt)} />
      </div>

      {!user.paymentMethodVerifiedAt && (
        <div className="mt-8 flex items-start gap-4 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--brand)] p-5 shadow-hard-sm">
          <CreditCard className="mt-1 shrink-0" />
          <div><p className="font-black">Verify a payment method to bid.</p><p className="mt-1 text-sm text-[var(--foreground)]/70">Losing bids are never charged. The winning bid is captured after the auction closes.</p></div>
        </div>
      )}

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Your startups</h2>
          <LinkButton href="/submit">Submit another <ArrowRight size={16} /></LinkButton>
        </div>
        <div className="mt-6 grid gap-5">
          {data.startups.length ? data.startups.map((startup) => (
            <article key={startup.id} className="grid gap-5 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <StartupMark name={startup.name} />
              <div>
                <div className="flex flex-wrap items-center gap-3"><Link href={`/startup/${startup.slug}`} className="text-xl font-black hover:text-[var(--accent)]">{startup.name}</Link><StatusPill tone={startup.status === "approved" ? "good" : "neutral"}>{startup.status}</StatusPill></div>
                <p className="mt-1 text-sm text-[var(--muted)]">{startup.tagline}</p>
              </div>
              <div className="flex gap-5 text-sm">
                <span className="flex items-center gap-1.5 font-bold"><MousePointerClick size={16} /> {counts.get(`${startup.id}:outbound_click`) || 0} clicks</span>
              </div>
            </article>
          )) : <div className="rounded-2xl border-2 border-dashed border-[var(--line)] p-10 text-center text-[var(--muted)]">No startup submitted yet.</div>}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Bid history</h2>
        <div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {data.bids.length ? data.bids.map(({ bid, auction }) => (
            <div key={bid.id} className="flex flex-wrap items-center gap-4 py-4 text-sm">
              {bid.status === "winning" ? <CheckCircle2 size={17} className="text-green-700" /> : <Clock3 size={17} className="text-[var(--muted)]" />}
              <span className="flex-1 font-bold capitalize">{bid.status.replace("_", " ")}</span>
              <span className="text-[var(--muted)]">Auction {auction.status}</span>
              <span className="font-mono font-black">{formatMoney(bid.amountCents)}</span>
            </div>
          )) : <p className="py-7 text-center text-sm text-[var(--muted)]">Your auction bids will appear here.</p>}
        </div>
      </section>
    </div>
  );
}
