import { StartupEditForm, StartupReviewControls } from "@/components/admin-controls";
import { StatusPill } from "@/components/ui";
import { getAdminData } from "@/db/queries";

export const dynamic = "force-dynamic";
export default async function AdminSubmissionsPage() {
  const data = await getAdminData();
  return <section><h2 className="text-2xl font-black">Pending submissions</h2><div className="mt-5 grid gap-4">{data.submissions.length ? data.submissions.map((startup) => <article key={startup.id} className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard-sm"><div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-3"><h3 className="text-xl font-black">{startup.name}</h3><StatusPill>{startup.launchStatus}</StatusPill></div><p className="mt-2 text-sm text-[var(--muted)]">{startup.tagline}</p><a href={startup.url} target="_blank" rel="noopener" className="mt-2 block text-sm font-bold underline">{startup.url}</a></div><StartupReviewControls startupId={startup.id} /></div><StartupEditForm startup={startup} /></article>) : <Empty>No submissions need review.</Empty>}</div></section>;
}
function Empty({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border-2 border-dashed border-[var(--line)] p-10 text-center text-[var(--muted)]">{children}</div>; }
