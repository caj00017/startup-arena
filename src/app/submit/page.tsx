import { SubmissionForm } from "@/components/submission-form";
import { StatusPill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const metadata = { title: "Submit your startup" };

export default async function SubmitPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
      <StatusPill tone="accent">Founder entry</StatusPill>
      <h1 className="mt-5 font-display text-6xl font-black tracking-[-0.055em]">Bring your best product.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">Submissions are reviewed for safety, functionality, and a fair presentation. Approval makes your startup eligible for challenger auctions.</p>
      <div className="mt-10"><SubmissionForm turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} /></div>
    </div>
  );
}
