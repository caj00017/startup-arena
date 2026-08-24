import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Startup Arena — Where startups compete for attention",
    template: "%s · Startup Arena"
  },
  description:
    "One startup battle every day. Explore both products, cast your vote, and decide who returns as champion.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="mx-auto grid w-full max-w-6xl justify-items-center gap-4 border-t border-[var(--line)] px-5 py-8 text-sm text-[var(--muted)] sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <p className="sm:justify-self-start">Startup Arena © {new Date().getUTCFullYear()}</p>
          <a
            className="font-bold text-[var(--foreground)] hover:text-[var(--accent)]"
            href="https://madebynexura.com"
          >
            Made by Nexura
          </a>
          <div className="flex flex-wrap justify-center gap-5 sm:justify-self-end">
            <a className="hover:text-[var(--foreground)]" href="/leaderboard">Leaderboard</a>
            <a className="hover:text-[var(--foreground)]" href="/rules">Rules</a>
            <a className="hover:text-[var(--foreground)]" href="/about">About</a>
            <a className="hover:text-[var(--foreground)]" href="/privacy">Privacy</a>
            <a className="hover:text-[var(--foreground)]" href="/terms">Terms</a>
            <a className="hover:text-[var(--foreground)]" href="/submit">Submit</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
