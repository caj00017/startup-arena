import { describe, expect, it } from "vitest";
import { resolveConfiguredRole } from "@/lib/auth";
import { createFounderReferralCode, parseFounderReferralCode } from "@/lib/analytics";
import { env, getProductionConfigurationErrors } from "@/lib/env";

const configuredProduction = {
  ...env,
  NODE_ENV: "production" as const,
  NEXT_PUBLIC_APP_URL: "https://startup-arena.test",
  DATABASE_URL: "postgres://pooled.test/database",
  DATABASE_URL_UNPOOLED: "postgres://unpooled.test/database",
  SESSION_SECRET: "a-production-session-secret-with-32-characters",
  ADMIN_EMAILS: "owner@startup-arena.test",
  CRON_SECRET: "a-production-cron-secret",
  IP_HASH_SECRET: "a-production-ip-hash-secret",
  RESEND_API_KEY: "re_test",
  EMAIL_FROM: "Startup Arena <hello@startup-arena.test>",
  STRIPE_SECRET_KEY: "sk_test_example",
  STRIPE_WEBHOOK_SECRET: "whsec_example",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "turnstile-site",
  TURNSTILE_SECRET_KEY: "turnstile-secret"
};

describe("production readiness", () => {
  it("accepts a fully configured production environment", () => {
    expect(getProductionConfigurationErrors(configuredProduction)).toEqual([]);
  });

  it("fails closed when launch services or bot protection are missing", () => {
    const errors = getProductionConfigurationErrors({
      ...configuredProduction,
      RESEND_API_KEY: undefined,
      STRIPE_SECRET_KEY: undefined,
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: undefined
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "RESEND_API_KEY is required",
        "STRIPE_SECRET_KEY is required",
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY is required"
      ])
    );
  });

  it("rejects a sender domain without a complete email address", () => {
    const errors = getProductionConfigurationErrors({
      ...configuredProduction,
      EMAIL_FROM: "mail.startup-arena.test"
    });

    expect(errors).toContain("EMAIL_FROM must use a verified production sender");
  });

  it("rejects crossed or malformed payment-provider credentials", () => {
    const crossedSecret = "0x4AAAAA-turnstile-secret";
    const errors = getProductionConfigurationErrors({
      ...configuredProduction,
      STRIPE_SECRET_KEY: crossedSecret,
      STRIPE_WEBHOOK_SECRET: "not-a-webhook-secret",
      TURNSTILE_SECRET_KEY: crossedSecret
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "STRIPE_SECRET_KEY must be a Stripe test or live secret key",
        "STRIPE_WEBHOOK_SECRET must be a Stripe webhook signing secret",
        "Stripe and Turnstile secret keys must be different"
      ])
    );
  });
});

describe("configured administrator access", () => {
  it("revokes removed administrators while preserving founder status", () => {
    expect(
      resolveConfiguredRole({
        email: "removed-admin@startup-arena.test",
        currentRole: "admin",
        ownsStartup: true
      })
    ).toBe("founder");
    expect(
      resolveConfiguredRole({
        email: "removed-admin@startup-arena.test",
        currentRole: "admin",
        ownsStartup: false
      })
    ).toBe("voter");
  });

  it("grants configured administrators their effective role immediately", () => {
    expect(
      resolveConfiguredRole({
        email: "admin@startuparena.local",
        currentRole: "voter",
        ownsStartup: false
      })
    ).toBe("admin");
  });
});

describe("founder referral attribution", () => {
  const battleId = "03000000-0000-4000-8000-000000000001";
  const startupId = "02000000-0000-4000-8000-000000000001";

  it("accepts an untampered battle and startup referral code", () => {
    const code = createFounderReferralCode(battleId, startupId);
    expect(parseFounderReferralCode(code)).toEqual({ battleId, startupId });
  });

  it("rejects malformed and tampered referral codes", () => {
    const code = createFounderReferralCode(battleId, startupId);
    expect(parseFounderReferralCode(`${code}x`)).toBeNull();
    expect(parseFounderReferralCode("not-a-referral")).toBeNull();
  });
});
