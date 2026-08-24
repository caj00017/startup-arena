import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusPill } from "@/components/ui";
import { getBattleReport } from "@/services/analytics";

export const dynamic = "force-dynamic";

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-5 shadow-hard-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-4xl font-black tracking-[-0.04em]">{value}</p>
      {detail && <p className="mt-2 text-xs font-bold text-[var(--muted)]">{detail}</p>}
    </div>
  );
}

export default async function BattleReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getBattleReport(id);
  if (!report) notFound();

  return (
    <section>
      <Link href="/admin/reports" className="inline-flex items-center gap-2 text-sm font-black hover:text-[var(--accent)]">
        <ArrowLeft size={16} /> All reports
      </Link>
      <div className="mt-6 flex flex-col gap-4 border-b-2 border-[var(--foreground)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <StatusPill tone={report.battle.status === "live" ? "live" : "neutral"}>{report.battle.status}</StatusPill>
          <h2 className="mt-4 font-display text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            {report.champion.startup.name} vs. {report.challenger.startup.name}
          </h2>
          <p className="mt-2 text-sm font-bold text-[var(--muted)]">
            {report.battle.startsAt.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })} UTC
          </p>
        </div>
        <Link href={`/battle/${report.battle.id}`} className="text-sm font-black underline">Open matchup</Link>
      </div>

      {report.analyticsAvailable ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="Unique visitors" value={report.uniqueVisitors} detail="Distinct first-party visitor hashes" />
            <Metric label="Verified votes" value={report.verifiedVotes} detail={`${percent.format(report.voteConversion)} of visitors`} />
            <Metric label="Returning visitors" value={report.returningVisitors} detail={`${percent.format(report.returningVisitorRate)} seen in the prior 7 days`} />
            <Metric label="Explored both" value={report.exploredBoth} detail={`${percent.format(report.exploredBothRate)} opened both destinations`} />
            <Metric label="Suspicious votes" value={report.suspiciousVotes} detail={`${percent.format(report.suspiciousVoteRate)} of ${report.totalVotes} total votes`} />
            <Metric label="Operator interventions" value={report.operationalInterventions} detail="Pause, moderation, or fallback actions" />
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] shadow-hard-sm">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b-2 border-[var(--foreground)] bg-[#edf3fa]">
                <tr>
                  <th className="p-4 font-black">Founder delivery</th>
                  <th className="p-4 font-black">{report.champion.startup.name}</th>
                  <th className="p-4 font-black">{report.challenger.startup.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                <ReportRow label="Outbound clicks" champion={report.champion.outboundClicks} challenger={report.challenger.outboundClicks} />
                <ReportRow label="Unique outbound visitors" champion={report.champion.uniqueOutboundVisitors} challenger={report.challenger.uniqueOutboundVisitors} />
                <ReportRow label="Founder shares" champion={report.champion.founderShares} challenger={report.challenger.founderShares} />
                <ReportRow label="Unique referred visitors" champion={report.champion.referredVisitors} challenger={report.challenger.referredVisitors} />
                <ReportRow label="Referral vote conversion" champion={percent.format(report.champion.referralVoteConversion)} challenger={percent.format(report.challenger.referralVoteConversion)} />
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-xs font-bold leading-relaxed text-[var(--muted)]">
            Visitor-based rates use anonymous first-party identifiers. A verified vote remains the database vote whose current fraud status is valid. Raw traffic and individual votes are deleted 30 days after finalization.
          </p>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-6 shadow-hard-sm">
          <StatusPill tone="neutral">Retention complete</StatusPill>
          <h3 className="mt-4 text-xl font-black">The raw traffic report is no longer retained.</h3>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Visitor events, individual votes, and their abuse-prevention hashes were deleted after the 30-day review window. The final score, winner, battle history, and leaderboard record remain available on the matchup page.
          </p>
        </div>
      )}
    </section>
  );
}

function ReportRow({
  label,
  champion,
  challenger
}: {
  label: string;
  champion: string | number;
  challenger: string | number;
}) {
  return (
    <tr>
      <th className="p-4 font-bold text-[var(--muted)]">{label}</th>
      <td className="p-4 font-mono font-black">{champion}</td>
      <td className="p-4 font-mono font-black">{challenger}</td>
    </tr>
  );
}
