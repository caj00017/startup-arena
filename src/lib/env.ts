import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  SESSION_SECRET: z.string().min(32).default("development-only-session-secret-change-me"),
  ADMIN_EMAILS: z.string().default("admin@startuparena.local"),
  CRON_SECRET: z.string().min(16).default("development-cron-secret"),
  IP_HASH_SECRET: z.string().min(16).default("development-ip-hash-secret"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Startup Arena <hello@example.com>"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  MAX_BID_CENTS: z.coerce.number().int().min(500).max(10_000_000).default(25_000)
});

export const env = environmentSchema.parse(process.env);

export type Environment = z.infer<typeof environmentSchema>;

function isPlaceholder(value: string) {
  return value.startsWith("development-") || value.includes("replace-with");
}

function hasValidSenderAddress(value: string) {
  const trimmed = value.trim();
  const namedSender = trimmed.match(/^[^<>]+<([^<>]+)>$/);
  const address = (namedSender?.[1] ?? trimmed).trim();
  return z.string().email().safeParse(address).success;
}

export function getProductionConfigurationErrors(current: Environment = env) {
  if (current.NODE_ENV !== "production") return [];

  const errors: string[] = [];
  const appUrl = new URL(current.NEXT_PUBLIC_APP_URL);

  if (appUrl.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(appUrl.hostname)) {
    errors.push("NEXT_PUBLIC_APP_URL must be the public HTTPS origin");
  }
  if (!current.DATABASE_URL) errors.push("DATABASE_URL is required");
  if (!current.DATABASE_URL_UNPOOLED) errors.push("DATABASE_URL_UNPOOLED is required for migrations");
  if (isPlaceholder(current.SESSION_SECRET)) errors.push("SESSION_SECRET must be replaced");
  if (isPlaceholder(current.CRON_SECRET)) errors.push("CRON_SECRET must be replaced");
  if (isPlaceholder(current.IP_HASH_SECRET)) errors.push("IP_HASH_SECRET must be replaced");
  if (new Set([current.SESSION_SECRET, current.CRON_SECRET, current.IP_HASH_SECRET]).size !== 3) {
    errors.push("SESSION_SECRET, CRON_SECRET, and IP_HASH_SECRET must be unique");
  }
  if (!current.ADMIN_EMAILS || current.ADMIN_EMAILS.includes(".local")) {
    errors.push("ADMIN_EMAILS must contain the production administrator addresses");
  }
  if (!current.RESEND_API_KEY) errors.push("RESEND_API_KEY is required");
  if (
    !current.EMAIL_FROM ||
    current.EMAIL_FROM.includes("example.com") ||
    !hasValidSenderAddress(current.EMAIL_FROM)
  ) {
    errors.push("EMAIL_FROM must use a verified production sender");
  }
  if (!current.STRIPE_SECRET_KEY) errors.push("STRIPE_SECRET_KEY is required");
  if (!current.STRIPE_WEBHOOK_SECRET) errors.push("STRIPE_WEBHOOK_SECRET is required");
  if (!current.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    errors.push("NEXT_PUBLIC_TURNSTILE_SITE_KEY is required");
  }
  if (!current.TURNSTILE_SECRET_KEY) errors.push("TURNSTILE_SECRET_KEY is required");

  return errors;
}

export function assertProductionSecrets() {
  const errors = getProductionConfigurationErrors();
  if (errors.length > 0) {
    throw new Error(`Production configuration is incomplete: ${errors.join("; ")}.`);
  }
}

export const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
