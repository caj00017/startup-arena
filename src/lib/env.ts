import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
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
  TURNSTILE_SECRET_KEY: z.string().optional()
});

export const env = environmentSchema.parse(process.env);

export function assertProductionSecrets() {
  if (
    env.NODE_ENV === "production" &&
    (env.SESSION_SECRET.startsWith("development-") || env.CRON_SECRET.startsWith("development-"))
  ) {
    throw new Error("Production secrets must be configured before serving Startup Arena.");
  }
}

export const adminEmails = new Set(
  env.ADMIN_EMAILS.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);
