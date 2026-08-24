"use client";

import { useState } from "react";
import { CreditCard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui";

export function AccountActions({ paymentVerified }: { paymentVerified: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function setupPayment() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/payments/setup", { method: "POST" });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setError(result.error || "Payment setup could not start.");
        setPending(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError("Payment setup could not start. Check your connection and try again.");
      setPending(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {!paymentVerified && <Button onClick={setupPayment} disabled={pending}><CreditCard size={17} /> {pending ? "Opening…" : "Verify payment"}</Button>}
        <Button onClick={signOut} className="bg-white text-[var(--foreground)] shadow-[3px_3px_0_var(--line)]"><LogOut size={17} /> Sign out</Button>
      </div>
      {error && <p role="alert" className="mt-3 max-w-sm text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
}
