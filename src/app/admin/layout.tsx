import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const links = [
  ["Submissions", "/admin/submissions"],
  ["Battle", "/admin/battle"],
  ["Auction", "/admin/auction"],
  ["Reports", "/admin/reports"],
  ["Moderation", "/admin/moderation"]
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="border-b-2 border-[var(--foreground)] pb-6"><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent)]">Operations</p><h1 className="mt-2 font-display text-5xl font-black tracking-[-0.05em]">Arena control room</h1><nav className="mt-6 flex flex-wrap gap-2">{links.map(([label, href]) => <Link key={href} href={href} className="rounded-full border-2 border-[var(--foreground)] bg-[var(--paper)] px-4 py-2 text-sm font-black hover:bg-[var(--brand)] hover:text-white">{label}</Link>)}</nav></div>
      <div className="py-8">{children}</div>
    </div>
  );
}
