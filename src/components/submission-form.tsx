"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button, Field, inputClass } from "./ui";

export function SubmissionForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        url: form.get("url"),
        tagline: form.get("tagline"),
        launchStatus: form.get("launchStatus"),
        logoUrl: form.get("logoUrl") || undefined,
        screenshotUrl: form.get("screenshotUrl") || undefined,
        founderSocialUrl: form.get("founderSocialUrl") || undefined,
        safetyConfirmed: form.get("safetyConfirmed") === "on"
      })
    });
    const result = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "Submission could not be saved.");
      return;
    }
    setSubmitted(true);
    router.refresh();
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border-2 border-[var(--foreground)] bg-[var(--brand)] p-8 text-center shadow-hard">
        <CheckCircle2 className="mx-auto" size={42} />
        <h2 className="mt-4 font-display text-4xl font-black">You’re in the review queue.</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--foreground)]/70">We’ll make sure the product works and the battle card is fair before approving it to bid.</p>
        <a href="/account" className="mt-6 inline-flex items-center gap-2 font-black underline">View your account <ArrowRight size={17} /></a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-6 rounded-3xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-6 shadow-hard sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Startup name"><input name="name" required maxLength={60} className={inputClass} placeholder="Acme" /></Field>
        <Field label="Product status">
          <select name="launchStatus" className={inputClass} defaultValue="live">
            <option value="live">Live</option><option value="beta">Beta</option><option value="waitlist">Waitlist</option>
          </select>
        </Field>
      </div>
      <Field label="Product URL"><input name="url" type="url" required className={inputClass} placeholder="https://yourstartup.com" /></Field>
      <Field label="One-sentence pitch" hint="Maximum 160 characters. Tell voters what the product does, not why it is revolutionary.">
        <textarea name="tagline" required maxLength={160} rows={3} className={`${inputClass} py-3`} placeholder="Help product teams…" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Logo URL" hint="Optional HTTPS image"><input name="logoUrl" type="url" className={inputClass} placeholder="https://…" /></Field>
        <Field label="Screenshot URL" hint="Optional HTTPS image"><input name="screenshotUrl" type="url" className={inputClass} placeholder="https://…" /></Field>
      </div>
      <Field label="Founder social profile" hint="Optional"><input name="founderSocialUrl" type="url" className={inputClass} placeholder="https://x.com/…" /></Field>
      <label className="flex items-start gap-3 rounded-xl bg-[#e7edf5] p-4 text-sm font-bold leading-relaxed">
        <input name="safetyConfirmed" type="checkbox" required className="mt-1 size-4 accent-[var(--brand-deep)]" />
        <span>I confirm this product is functional, legal to promote, and safe for visitors to open.</span>
      </label>
      <Button type="submit" disabled={pending} className="sm:w-fit">{pending ? "Submitting…" : <>Submit for review <ArrowRight size={17} /></>}</Button>
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    </form>
  );
}
