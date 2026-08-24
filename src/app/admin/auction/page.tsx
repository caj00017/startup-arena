import { PauseControl, WildcardControl } from "@/components/admin-controls";
import { StatusPill } from "@/components/ui";
import { getAdminData } from "@/db/queries";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function AdminAuctionPage() {
  const data = await getAdminData();
  return <section><h2 className="text-2xl font-black">Auction operations</h2><p className="mt-2 text-sm text-[var(--muted)]">Choose a reviewed fallback before close so the next battle can continue if there are no payable bids. Completed auctions remain visible here as settlement history.</p><div className="mt-6 grid gap-4">{data.auctions.length === 0 && <p className="rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--paper)] p-5 text-sm font-bold text-[var(--muted)]">No auctions have been created yet.</p>}{data.auctions.map((auction) => {
    const canPause = auction.status === "open" || auction.status === "paused";
    const canSetWildcard = !["awarded", "cancelled"].includes(auction.status);
    return <article key={auction.id} className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><StatusPill>{auction.status}</StatusPill>{canPause && <PauseControl kind="auction" id={auction.id} status={auction.status} />}</div><span className="text-sm font-bold">Closes {auction.closesAt.toISOString()}</span></div><p className="mt-4 text-sm text-[var(--muted)]">Minimum {formatMoney(auction.minimumBidCents)} · Increment {formatMoney(auction.minimumIncrementCents)}</p>{canSetWildcard ? <div className="mt-4"><WildcardControl auctionId={auction.id} currentId={auction.wildcardStartupId} startups={data.approvedStartups} /></div> : <p className="mt-4 text-sm font-bold text-[var(--muted)]">Settlement complete. This auction is read-only.</p>}</article>;
  })}</div></section>;
}
