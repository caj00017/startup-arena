import { redirect } from "next/navigation";
import { SignInForm } from "@/components/signin-form";
import { StatusPill } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { env } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  if (user) redirect(params.next?.startsWith("/") ? params.next : "/account");

  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:py-24">
      <div className="rounded-3xl border-2 border-[var(--foreground)] bg-[var(--paper)] p-7 shadow-hard sm:p-10">
        <StatusPill tone="accent">One verified person, one vote</StatusPill>
        <h1 className="mt-6 font-display text-5xl font-black tracking-[-0.05em]">Step into the arena.</h1>
        <p className="mt-4 leading-relaxed text-[var(--muted)]">Sign in to vote, submit a startup, or compete for tomorrow’s challenger slot.</p>
        <SignInForm next={params.next} turnstileSiteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
      </div>
    </div>
  );
}
