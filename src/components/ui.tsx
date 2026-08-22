import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_var(--accent)] transition disabled:cursor-not-allowed disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_var(--accent)] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs font-normal text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "min-h-12 w-full rounded-xl border-2 border-[var(--line)] bg-white px-4 text-base font-medium transition focus:border-[var(--foreground)] focus:outline-none";

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "live" | "accent" | "good" }) {
  const tones = {
    neutral: "bg-[#e7edf5]",
    live: "border border-[var(--foreground)] bg-[var(--brand)] text-white",
    accent: "bg-[var(--brand)] text-white",
    good: "bg-[var(--brand-soft)]"
  };
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.08em]", tones[tone])}>{children}</span>;
}
