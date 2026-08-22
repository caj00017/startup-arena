import { VoteModerationControls } from "@/components/admin-controls";
import { getAdminData } from "@/db/queries";

export const dynamic = "force-dynamic";
export default async function AdminModerationPage() {
  const data = await getAdminData();
  return <section><h2 className="text-2xl font-black">Vote review queue</h2><div className="mt-5 divide-y divide-[var(--line)] border-y border-[var(--line)]">{data.votes.length ? data.votes.map(({ vote, user }) => <div key={vote.id} className="flex flex-wrap items-center gap-4 py-4 text-sm"><span className="min-w-0 flex-1"><strong>{user.email}</strong><span className="ml-3 text-[var(--muted)]">{vote.fraudStatus}</span></span><code className="text-xs text-[var(--muted)]">{vote.ipHash.slice(0, 12)}…</code><VoteModerationControls voteId={vote.id} /></div>) : <p className="py-8 text-center text-[var(--muted)]">No votes need review.</p>}</div></section>;
}
