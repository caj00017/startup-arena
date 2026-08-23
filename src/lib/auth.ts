import { and, eq, gt, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { magicLinks, sessions, startups, users, type User } from "@/db/schema";
import { adminEmails, assertProductionSecrets, env } from "./env";
import { hashToken, randomToken } from "./security";

const sessionCookie = "arena_session";
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;

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
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(magicLinks).values({ email, tokenHash: hashToken(token), expiresAt });

  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;
  return { email, verifyUrl, expiresAt };
}

export async function consumeMagicLink(token: string) {
  const result = await redeemMagicLinkToken(token);
  if (!result) return null;

  (await cookies()).set(sessionCookie, result.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationMs / 1000
  });

  return result.user;
}

export async function redeemMagicLinkToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [link] = await tx
      .update(magicLinks)
      .set({ consumedAt: now })
      .where(
        and(
          eq(magicLinks.tokenHash, tokenHash),
          isNull(magicLinks.consumedAt),
          gt(magicLinks.expiresAt, now)
        )
      )
      .returning();

    if (!link) return null;

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

    return { user, sessionToken };
  });
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
      html: `<p>Sign in to Startup Arena:</p><p><a href="${verifyUrl}">Continue to Startup Arena</a></p><p>This link expires in 15 minutes.</p>`
    })
  });

  if (!response.ok) throw new Error("Email provider rejected the sign-in message.");
  return { delivered: true as const };
}
