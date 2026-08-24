"use client";

import { useEffect, useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { Button, Field, inputClass } from "./ui";
import { Turnstile } from "./turnstile";

export function SignInForm({ next = "/", turnstileSiteKey }: { next?: string; turnstileSiteKey?: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const [devUrl, setDevUrl] = useState("");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  useEffect(() => {
    if (!waiting) return;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/account";

    async function poll() {
      try {
        const response = await fetch("/api/auth/complete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}"
        });
        const result = (await response.json()) as {
          status?: "pending" | "authenticated" | "expired" | "missing" | "claimed";
          redirect?: string;
        };
        if (!active) return;

        if (result.status === "authenticated") {
          window.location.assign(result.redirect || destination);
          return;
        }
        if (result.status === "expired" || result.status === "missing") {
          setWaiting(false);
          setError("This sign-in request expired. Request a new link.");
          if (turnstileSiteKey) setTurnstileReset((value) => value + 1);
          return;
        }
      } catch {
        // Brief network interruptions should not cancel an otherwise valid login attempt.
      }

      timer = setTimeout(poll, 3_000);
    }

    timer = setTimeout(poll, 1_000);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [next, turnstileSiteKey, waiting]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, next, turnstileToken: turnstileToken || undefined })
    });
    const result = (await response.json()) as { message?: string; devUrl?: string; error?: string };
    setPending(false);
    if (!response.ok) {
      setError(result.error || "Sign-in link could not be created.");
      if (turnstileSiteKey) setTurnstileReset((value) => value + 1);
      return;
    }
    setMessage(result.message || "Check your inbox.");
    setDevUrl(result.devUrl || "");
    setWaiting(true);
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
      <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} resetKey={turnstileReset} />
      <Button
        type="submit"
        disabled={pending || waiting || Boolean(turnstileSiteKey && !turnstileToken)}
        className="w-full"
      >
        {pending ? (
          "Sending…"
        ) : waiting ? (
          "Waiting for verification…"
        ) : (
          <>
            Send sign-in link <ArrowRight size={17} />
          </>
        )}
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
