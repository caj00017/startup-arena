import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, events, startups, users } from "@/db/schema";
import { normalizeUrl, slugify } from "@/lib/utils";

export async function submitStartup(input: {
  userId: string;
  name: string;
  url: string;
  tagline: string;
  launchStatus: "live" | "beta" | "waitlist";
  logoUrl?: string;
  screenshotUrl?: string;
  demoUrl?: string;
  founderSocialUrl?: string;
  safetyConfirmed: boolean;
}) {
  const normalizedUrl = normalizeUrl(input.url);
  const slugBase = slugify(input.name) || "startup";
  const [slugCollision] = await db
    .select({ id: startups.id })
    .from(startups)
    .where(eq(startups.slug, slugBase))
    .limit(1);
  const slug = slugCollision ? `${slugBase}-${crypto.randomUUID().slice(0, 6)}` : slugBase;

  return db.transaction(async (tx) => {
    const [startup] = await tx
      .insert(startups)
      .values({
        ownerId: input.userId,
        name: input.name.trim(),
        slug,
        url: normalizedUrl,
        tagline: input.tagline.trim(),
        logoUrl: input.logoUrl ? normalizeUrl(input.logoUrl) : null,
        screenshotUrl: input.screenshotUrl ? normalizeUrl(input.screenshotUrl) : null,
        demoUrl: input.demoUrl ? normalizeUrl(input.demoUrl) : null,
        founderSocialUrl: input.founderSocialUrl ? normalizeUrl(input.founderSocialUrl) : null,
        launchStatus: input.launchStatus,
        safetyConfirmed: input.safetyConfirmed,
        status: "pending"
      })
      .returning();

    await tx
      .update(users)
      .set({ role: "founder", updatedAt: new Date() })
      .where(and(eq(users.id, input.userId), eq(users.role, "voter")));
    await tx.insert(events).values({
      eventType: "startup_submission",
      startupId: startup.id,
      userId: input.userId
    });
    await tx.insert(auditLogs).values({
      actorUserId: input.userId,
      action: "startup.submitted",
      entityType: "startup",
      entityId: startup.id
    });
    return startup;
  });
}

export async function reviewStartup(input: {
  startupId: string;
  status: "approved" | "rejected" | "suspended";
  adminUserId: string;
}) {
  return db.transaction(async (tx) => {
    const [startup] = await tx
      .update(startups)
      .set({
        status: input.status,
        approvedAt: input.status === "approved" ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(startups.id, input.startupId))
      .returning();
    if (!startup) throw new Error("Startup not found.");
    await tx.insert(auditLogs).values({
      actorUserId: input.adminUserId,
      action: `startup.${input.status}`,
      entityType: "startup",
      entityId: input.startupId
    });
    return startup;
  });
}

export async function updateStartupPresentation(input: {
  startupId: string;
  adminUserId: string;
  name?: string;
  tagline?: string;
  url?: string;
}) {
  const updates: { name?: string; tagline?: string; url?: string; updatedAt: Date } = {
    updatedAt: new Date()
  };
  if (input.name) updates.name = input.name.trim();
  if (input.tagline) updates.tagline = input.tagline.trim();
  if (input.url) updates.url = normalizeUrl(input.url);

  return db.transaction(async (tx) => {
    const [startup] = await tx
      .update(startups)
      .set(updates)
      .where(eq(startups.id, input.startupId))
      .returning();
    if (!startup) throw new Error("Startup not found.");
    await tx.insert(auditLogs).values({
      actorUserId: input.adminUserId,
      action: "startup.presentation_updated",
      entityType: "startup",
      entityId: input.startupId,
      metadata: { fields: Object.keys(updates).filter((field) => field !== "updatedAt") }
    });
    return startup;
  });
}
