import { and, count, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { magicLinks } from "@/db/schema";
import { issueMagicLink, sendMagicLink } from "@/lib/auth";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { assertSameOrigin, verifyTurnstile } from "@/lib/security";

const schema = z.object({
  email: z.string().email().max(254),
  next: z.string().max(300).default("/"),
  turnstileToken: z.string().max(2_048).optional()
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const input = schema.parse(await request.json());
    if (!(await verifyTurnstile(input.turnstileToken))) {
      return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
    }

    const email = input.email.trim().toLowerCase();
    const [recent] = await db
      .select({ total: count() })
      .from(magicLinks)
      .where(
        and(
          eq(magicLinks.email, email),
          gt(magicLinks.createdAt, new Date(Date.now() - 15 * 60 * 1000))
        )
      );
    if (Number(recent?.total ?? 0) >= 3) {
      return NextResponse.json({ error: "Too many sign-in links requested. Try again shortly." }, { status: 429 });
    }

    const magic = await issueMagicLink(email, input.next);
    const delivery = await sendMagicLink(magic.email, magic.verifyUrl);
    return NextResponse.json({
      message: delivery.delivered ? "Check your inbox for a sign-in link." : "Development link created below.",
      devUrl: env.NODE_ENV === "production" ? undefined : magic.verifyUrl
    });
  } catch (error) {
    return jsonError(error);
  }
}
