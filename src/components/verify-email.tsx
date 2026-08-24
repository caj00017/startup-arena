"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { StatusPill } from "./ui";

type VerificationState = "verifying" | "verified" | "error";

export function VerifyEmail() {
  const [state, setState] = useState<VerificationState>("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function verify() {
      const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
      window.history.replaceState(null, "", window.location.pathname);
      if (!token) {
        setState("error");
        setError("This verification link is missing its token.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token })
        });
        const result = (await response.json()) as {
          status?: "authenticated" | "verified";
          redirect?: string;
          error?: string;
        };
        if (!active) return;

        if (!response.ok) {
          setState("error");
          setError(result.error || "This verification link is invalid or expired.");
          return;
        }
        if (result.status === "authenticated") {
          window.location.assign(result.redirect || "/account");
          return;
        }
        setState("verified");
      } catch {
        if (!active) return;
        setState("error");
        setError("Verification could not be completed. Please try again.");
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-3xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-7 shadow-hard sm:p-10">
      <StatusPill tone={state === "error" ? "accent" : "good"}>
        {state === "verifying"
          ? "Verifying email"
          : state === "verified"
            ? "Email verified"
            : "Link unavailable"}
      </StatusPill>
      {state === "verifying" ? (
        <LoaderCircle className="mt-8 animate-spin text-[var(--brand-deep)]" size={44} />
      ) : (
        <CheckCircle2 className="mt-8 text-[var(--success)]" size={44} />
      )}
      <h1 className="mt-5 font-display text-5xl font-black tracking-[-0.05em]">
        {state === "verifying"
          ? "Checking your link…"
          : state === "verified"
            ? "You’re cleared to enter."
            : "We couldn’t verify this link."}
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--muted)]">
        {state === "verifying"
          ? "This should only take a moment."
          : state === "verified"
            ? "Return to the browser where you requested the link. That tab will sign in automatically. You can close this page."
            : error}
      </p>
      {state !== "verifying" && (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Lost the original tab?{" "}
          <Link href="/signin" className="font-bold text-[var(--brand-deep)] underline">
            Start a new sign-in
          </Link>
          .
        </p>
      )}
    </div>
  );
}
