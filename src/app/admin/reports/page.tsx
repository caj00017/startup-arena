import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusPill } from "@/components/ui";
import { getBattleReportList } from "@/services/analytics";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getBattleReportList();

  return (
    <section>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">Pilot evidence</p>
        <h2 className="mt-2 text-2xl font-black">Battle reports</h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          These reports use first-party anonymous visitor hashes and remain available for 30 days after finalization. Security fingerprints and raw identifiers are never displayed.
        </p>
      </div>
      <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {reports.length ? reports.map(({ battle, champion, challenger, analyticsAvailable }) => (
          <Link
            href={`/admin/reports/${battle.id}`}
            key={battle.id}
            className="flex flex-col gap-3 py-5 hover:text-[var(--accent)] sm:flex-row sm:items-center"
          >
            <StatusPill tone={battle.status === "live" ? "live" : "neutral"}>
              {analyticsAvailable ? battle.status : "data expired"}
            </StatusPill>
            <span className="flex-1 font-black">{champion.name} vs. {challenger.name}</span>
            <span className="text-sm font-bold text-[var(--muted)]">
              {battle.startsAt.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}
            </span>
            <ArrowRight size={17} />
          </Link>
        )) : (
          <p className="py-8 text-center text-sm text-[var(--muted)]">Battle reports will appear after the first matchup is created.</p>
        )}
      </div>
    </section>
  );
}
