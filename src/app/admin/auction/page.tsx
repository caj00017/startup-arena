import { PauseControl, WildcardControl } from "@/components/admin-controls";
import { StatusPill } from "@/components/ui";
import { getAdminData } from "@/db/queries";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function AdminAuctionPage() {
  const data = await getAdminData();
  return <section><h2 className="text-2xl font-black">Auction operations</h2><p className="mt-2 text-sm text-[var(--muted)]">Choose a reviewed fallback before close so the next battle can continue if there are no payable bids.</p><div className="mt-6 grid gap-4">{data.auctions.map((auction) => <article key={auction.id} className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><StatusPill>{auction.status}</StatusPill><PauseControl kind="auction" id={auction.id} status={auction.status} /></div><span className="text-sm font-bold">Closes {auction.closesAt.toISOString()}</span></div><p className="mt-4 text-sm text-[var(--muted)]">Minimum {formatMoney(auction.minimumBidCents)} · Increment {formatMoney(auction.minimumIncrementCents)}</p><div className="mt-4"><WildcardControl auctionId={auction.id} currentId={auction.wildcardStartupId} startups={data.approvedStartups} /></div></article>)}</div></section>;
}
