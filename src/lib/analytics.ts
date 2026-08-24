import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { assertProductionSecrets, env } from "./env";
import { randomToken, secureEqual } from "./security";

const visitorCookie = "arena_visitor";
const visitorDurationSeconds = 8 * 24 * 60 * 60;
const visitorTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export function hashAnalyticsVisitor(token: string) {
  return createHmac("sha256", env.IP_HASH_SECRET)
    .update(`analytics-visitor:${token}`)
    .digest("hex");
}

function referralSignature(battleId: string, startupId: string) {
  return createHmac("sha256", env.IP_HASH_SECRET)
    .update(`founder-referral:${battleId}:${startupId}`)
    .digest("base64url");
}

export function createFounderReferralCode(battleId: string, startupId: string) {
  return `${battleId}.${startupId}.${referralSignature(battleId, startupId)}`;
}

export function parseFounderReferralCode(value?: string) {
  if (!value || value.length > 160) return null;
  const [battleId, startupId, signature, ...extra] = value.split(".");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (
    extra.length > 0 ||
    !battleId ||
    !startupId ||
    !signature ||
    !uuidPattern.test(battleId) ||
    !uuidPattern.test(startupId)
  ) {
    return null;
  }
  if (!secureEqual(signature, referralSignature(battleId, startupId))) return null;
  return { battleId, startupId };
}

export async function getAnalyticsVisitorHash() {
  assertProductionSecrets();
  const cookieStore = await cookies();
  const existing = cookieStore.get(visitorCookie)?.value;
  const token = existing && visitorTokenPattern.test(existing) ? existing : randomToken();

  if (token !== existing) {
    cookieStore.set(visitorCookie, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: visitorDurationSeconds,
      priority: "low"
    });
  }

  return hashAnalyticsVisitor(token);
}
