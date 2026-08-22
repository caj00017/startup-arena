"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CreditCard, Gavel, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, LinkButton, StatusPill, inputClass } from "./ui";
import { Countdown } from "./countdown";
import { formatMoney } from "@/lib/utils";

type AuctionStartup = { id: string; name: string; status: string };
type PublicBid = { id: string; amountCents: number; startup: { name: string; slug: string } };

export function AuctionPanel({
  auction,
  publicBids,
  startups,
  signedIn,
  paymentVerified
}: {
  auction: {
    id: string;
    closesAt: Date | string;
    status: string;
    minimumBidCents: number;
    minimumIncrementCents: number;
  };
  publicBids: PublicBid[];
  startups: AuctionStartup[];
  signedIn: boolean;
  paymentVerified: boolean;
}) {
  const router = useRouter();
  const topBid = publicBids[0]?.amountCents ?? null;
  const minimum = topBid
    ? topBid + auction.minimumIncrementCents
    : auction.minimumBidCents;
  const [startupId, setStartupId] = useState(startups.find((item) => item.status === "approved")?.id || "");
  const [amount, setAmount] = useState((minimum / 100).toString());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isOpen = auction.status === "open" && new Date(auction.closesAt) > new Date();
  const eligible = useMemo(() => startups.filter((item) => item.status === "approved"), [startups]);

  async function placeBid() {
    setPending(true);
    setError("");
    setSuccess("");
    const response = await fetch("/api/bids", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ auctionId: auction.id, startupId, amountCents: Math.round(Number(amount) * 100) })
    });
    const result = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "Bid could not be placed.");
      return;
    }
    setSuccess("You’re leading the auction.");
    router.refresh();
  }

  async function setupPayment() {
    setPending(true);
    const response = await fetch("/api/payments/setup", { method: "POST" });
    const result = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !result.url) {
      setPending(false);
      setError(result.error || "Payment setup could not start.");
      return;
    }
    window.location.assign(result.url);
  }

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-[var(--foreground)] bg-[var(--arena-dark)] text-white shadow-hard">
      <div className="grid lg:grid-cols-[1.1fr_.9fr]">
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill tone="accent"><Gavel size={14} /> Next challenger</StatusPill>
            <Countdown target={auction.closesAt} label="Auction closes" />
          </div>
          <h2 className="mt-7 font-display text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Think your startup can win?
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
            Highest valid bid gets tomorrow’s 24-hour challenger slot. Losing bidders pay nothing.
          </p>

          <div className="mt-7 grid gap-3">
            {!signedIn ? (
              <LinkButton href="/signin?next=/" className="w-fit bg-[var(--brand)] text-white shadow-[3px_3px_0_var(--accent)]">
                Sign in to bid <ArrowRight size={17} />
              </LinkButton>
            ) : eligible.length === 0 ? (
              <LinkButton href="/submit" className="w-fit bg-[var(--brand)] text-white shadow-[3px_3px_0_var(--accent)]">
                Submit a startup first <ArrowRight size={17} />
              </LinkButton>
            ) : !paymentVerified ? (
              <Button onClick={setupPayment} disabled={pending} className="w-fit bg-[var(--brand)] text-white shadow-[3px_3px_0_var(--accent)]">
                <CreditCard size={17} /> Verify payment method
              </Button>
            ) : isOpen ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
                <select value={startupId} onChange={(event) => setStartupId(event.target.value)} className={`${inputClass} border-white/20 bg-white text-[var(--foreground)]`}>
                  {eligible.map((startup) => <option value={startup.id} key={startup.id}>{startup.name}</option>)}
                </select>
                <label className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-[var(--foreground)]">$</span>
                  <input
                    type="number"
                    min={minimum / 100}
                    step={auction.minimumIncrementCents / 100}
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className={`${inputClass} border-white/20 bg-white pl-8 text-[var(--foreground)]`}
                    aria-label="Bid amount in dollars"
                  />
                </label>
                <Button onClick={placeBid} disabled={pending || !startupId} className="bg-[var(--brand)] text-white shadow-[3px_3px_0_var(--accent)]">
                  {pending ? "Placing…" : "Place bid"}
                </Button>
              </div>
            ) : (
              <p className="font-bold text-white/70">This auction is settling. The next one opens with tomorrow’s battle.</p>
            )}
            {isOpen && <p className="text-xs font-bold text-white/55">Minimum valid bid: {formatMoney(minimum)}. Winner pays their bid after the auction closes.</p>}
            {error && <p role="alert" className="text-sm font-bold text-[#ffb5a1]">{error}</p>}
            {success && <p className="text-sm font-bold text-[#8fc2ff]">{success}</p>}
          </div>
        </div>

        <div className="border-t-2 border-white/20 bg-white/8 p-6 sm:p-8 lg:border-t-0 lg:border-l-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black">Live bid board</h3>
            <TrendingUp size={19} className="text-[#8fc2ff]" />
          </div>
          <div className="mt-5 grid gap-2">
            {publicBids.length ? publicBids.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-xs font-black">{index + 1}</span>
                <a href={`/startup/${item.startup.slug}`} className="min-w-0 flex-1 truncate font-bold hover:text-[#8fc2ff]">{item.startup.name}</a>
                <span className="font-mono font-black text-[#8fc2ff]">{formatMoney(item.amountCents)}</span>
              </div>
            )) : (
              <div className="rounded-xl border border-dashed border-white/30 p-5 text-center text-sm font-bold text-white/60">
                No bids yet. The first valid bid starts at {formatMoney(auction.minimumBidCents)}.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
