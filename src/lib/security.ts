import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { assertProductionSecrets, env } from "./env";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(value: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}

export function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function getRequestFingerprint() {
  assertProductionSecrets();
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  const userAgent = requestHeaders.get("user-agent") || "unknown";

  return {
    ipHash: createHmac("sha256", env.IP_HASH_SECRET).update(ip).digest("hex"),
    userAgentHash: createHash("sha256").update(userAgent).digest("hex")
  };
}

export async function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (env.NODE_ENV === "production") throw new Error("Request origin is required.");
    return;
  }

  const expected = new URL(env.NEXT_PUBLIC_APP_URL).origin;
  if (new URL(origin).origin !== expected) {
    throw new Error("Request origin is not allowed.");
  }
}

export async function verifyTurnstile(token?: string | null) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token })
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
