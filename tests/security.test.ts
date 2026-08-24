import { describe, expect, it } from "vitest";
import { resolveConfiguredRole } from "@/lib/auth";
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
  STRIPE_SECRET_KEY: "sk_test",
  STRIPE_WEBHOOK_SECRET: "whsec_test",
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
