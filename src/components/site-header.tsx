import Link from "next/link";
import { Swords } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--background)]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5 font-black tracking-[-0.04em]">
          <span className="grid size-9 place-items-center rounded-full border-2 border-[var(--foreground)] bg-[var(--brand)] text-white">
            <Swords size={18} strokeWidth={2.5} />
          </span>
          <span className="text-xl" aria-label="startuparena.io">
            <span>startup</span><span className="text-[var(--accent)]">arena</span><span className="text-[var(--muted)]">.io</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-bold sm:gap-5">
          <Link href="/rules" className="hidden hover:text-[var(--accent)] sm:block">Rules</Link>
          <Link href="/submit" className="hidden hover:text-[var(--accent)] sm:block">Submit</Link>
          {user?.role === "admin" && (
            <Link href="/admin/submissions" className="hidden hover:text-[var(--accent)] sm:block">Admin</Link>
          )}
          {user ? (
            <Link
              href="/account"
              className="rounded-full border-2 border-[var(--foreground)] bg-[var(--paper)] px-4 py-2 shadow-[2px_2px_0_var(--foreground)] transition-transform active:translate-y-px active:shadow-none"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/signin"
              className="rounded-full bg-[var(--foreground)] px-4 py-2 text-white hover:bg-[var(--brand)]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
