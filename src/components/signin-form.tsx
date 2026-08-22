"use client";

import { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button, Field, inputClass } from "./ui";

export function SignInForm({ next = "/" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, next })
    });
    const result = (await response.json()) as { message?: string; devUrl?: string; error?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "Sign-in link could not be created.");
      return;
    }
    setMessage(result.message || "Check your inbox.");
    setDevUrl(result.devUrl || "");
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      <Field label="Email address" hint="No password. We’ll send you a secure, single-use link.">
        <div className="relative">
          <Mail className="absolute left-4 top-3.5 text-[var(--muted)]" size={19} />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className={`${inputClass} pl-12`}
          />
        </div>
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending…" : <>Send sign-in link <ArrowRight size={17} /></>}
      </Button>
      {message && <p className="rounded-xl bg-[var(--brand-soft)] p-4 text-sm font-bold">{message}</p>}
      {devUrl && (
        <a href={devUrl} className="rounded-xl border-2 border-dashed border-[var(--foreground)] p-4 text-center text-sm font-black hover:bg-[var(--brand)] hover:text-white">
          Development only: open magic link
        </a>
      )}
      {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
    </form>
  );
}
