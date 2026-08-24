import { and, eq, gt, isNotNull, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { magicLinks, sessions, startups, users, type User } from "@/db/schema";
import { adminEmails, assertProductionSecrets, env } from "./env";
import { hashToken, randomToken } from "./security";

const sessionCookie = "arena_session";
const loginAttemptCookie = "arena_login_attempt";
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;
const magicLinkDurationMs = 15 * 60 * 1000;

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationMs / 1000
  };
}

function loginAttemptCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(sessionCookie)?.value;
  assertProductionSecrets();
  if (!token) return null;

  const [result] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result?.user ? reconcileConfiguredRole(result.user) : null;
}

export function resolveConfiguredRole(input: {
  email: string;
  currentRole: User["role"];
  ownsStartup: boolean;
}) {
  if (adminEmails.has(input.email.trim().toLowerCase())) return "admin" as const;
  if (input.currentRole !== "admin") return input.currentRole;
  return input.ownsStartup ? ("founder" as const) : ("voter" as const);
}

async function reconcileConfiguredRole(user: User) {
  const needsOwnershipCheck = user.role === "admin" && !adminEmails.has(user.email);
  const [ownedStartup] = needsOwnershipCheck
    ? await db.select({ id: startups.id }).from(startups).where(eq(startups.ownerId, user.id)).limit(1)
    : [];
  const role = resolveConfiguredRole({
    email: user.email,
    currentRole: user.role,
    ownsStartup: Boolean(ownedStartup)
  });

  if (role === user.role) return user;
  const now = new Date();
  await db.update(users).set({ role, updatedAt: now }).where(eq(users.id, user.id));
  return { ...user, role, updatedAt: now };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

export async function issueMagicLink(emailValue: string, next = "/") {
  assertProductionSecrets();
  const email = emailValue.trim().toLowerCase();
  const token = randomToken();
  const browserToken = randomToken();
  const expiresAt = new Date(Date.now() + magicLinkDurationMs);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  await db.insert(magicLinks).values({
    email,
    tokenHash: hashToken(token),
    browserTokenHash: hashToken(browserToken),
    nextPath: safeNext,
    expiresAt
  });

  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/signin/verify#token=${encodeURIComponent(token)}`;
  return { email, verifyUrl, expiresAt, browserToken };
}

export async function rememberMagicLinkBrowser(browserToken: string, expiresAt: Date) {
  const secondsRemaining = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
  (await cookies()).set(
    loginAttemptCookie,
    browserToken,
    loginAttemptCookieOptions(secondsRemaining)
  );
}

export async function verifyMagicLinkToken(token: string) {
  const now = new Date();
  const [link] = await db
    .update(magicLinks)
    .set({ consumedAt: now })
    .where(
      and(
        eq(magicLinks.tokenHash, hashToken(token)),
        isNull(magicLinks.consumedAt),
        gt(magicLinks.expiresAt, now)
      )
    )
    .returning();

  return link ?? null;
}

export async function claimMagicLinkAttempt(browserToken: string, expectedLinkId?: string) {
  const browserTokenHash = hashToken(browserToken);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(magicLinks)
      .where(
        expectedLinkId
          ? and(
              eq(magicLinks.browserTokenHash, browserTokenHash),
              eq(magicLinks.id, expectedLinkId)
            )
          : eq(magicLinks.browserTokenHash, browserTokenHash)
      )
      .limit(1);

    if (!attempt) return { status: "missing" as const };
    if (attempt.expiresAt <= now) return { status: "expired" as const };
    if (!attempt.consumedAt) return { status: "pending" as const };
    if (attempt.claimedAt) return { status: "claimed" as const };

    const [link] = await tx
      .update(magicLinks)
      .set({ claimedAt: now })
      .where(
        and(
          eq(magicLinks.id, attempt.id),
          isNotNull(magicLinks.consumedAt),
          isNull(magicLinks.claimedAt),
          gt(magicLinks.expiresAt, now)
        )
      )
      .returning();

    if (!link) return { status: "claimed" as const };

    const [existingUser] = await tx.select().from(users).where(eq(users.email, link.email)).limit(1);
    const needsOwnershipCheck = existingUser?.role === "admin" && !adminEmails.has(link.email);
    const [ownedStartup] = existingUser && needsOwnershipCheck
      ? await tx
          .select({ id: startups.id })
          .from(startups)
          .where(eq(startups.ownerId, existingUser.id))
          .limit(1)
      : [];
    const role = existingUser
      ? resolveConfiguredRole({
          email: link.email,
          currentRole: existingUser.role,
          ownsStartup: Boolean(ownedStartup)
        })
      : adminEmails.has(link.email)
        ? "admin"
        : "voter";

    const [user] = existingUser
      ? await tx
          .update(users)
          .set({ emailVerifiedAt: now, role, updatedAt: now })
          .where(eq(users.id, existingUser.id))
          .returning()
      : await tx
          .insert(users)
          .values({ email: link.email, role, emailVerifiedAt: now })
          .returning();

    const sessionToken = randomToken();
    await tx.insert(sessions).values({
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(now.getTime() + sessionDurationMs)
    });

    return {
      status: "authenticated" as const,
      user,
      sessionToken,
      nextPath: link.nextPath
    };
  });
}

export async function claimMagicLinkForBrowser(expectedLinkId?: string) {
  const cookieStore = await cookies();
  const browserToken = cookieStore.get(loginAttemptCookie)?.value;
  if (!browserToken) return { status: "missing" as const };

  const result = await claimMagicLinkAttempt(browserToken, expectedLinkId);
  if (result.status === "authenticated") {
    cookieStore.set(sessionCookie, result.sessionToken, sessionCookieOptions());
    cookieStore.set(loginAttemptCookie, "", loginAttemptCookieOptions(0));
    return { status: result.status, user: result.user, nextPath: result.nextPath };
  }

  if (
    result.status === "expired" ||
    result.status === "claimed" ||
    (result.status === "missing" && !expectedLinkId)
  ) {
    cookieStore.set(loginAttemptCookie, "", loginAttemptCookieOptions(0));
  }
  return result;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  cookieStore.delete(sessionCookie);
}

export async function sendMagicLink(email: string, verifyUrl: string) {
  if (!env.RESEND_API_KEY) {
    if (env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is required in production.");
    return { delivered: false as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Your Startup Arena sign-in link",
      html: `<p>Verify your email for Startup Arena:</p><p><a href="${verifyUrl}">Verify email</a></p><p>The browser where you started will sign in automatically. This link expires in 15 minutes.</p>`
    })
  });

  if (!response.ok) throw new Error("Email provider rejected the sign-in message.");
  return { delivered: true as const };
}
