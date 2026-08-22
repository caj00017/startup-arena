import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin, verifyTurnstile } from "@/lib/security";
import { submitStartup } from "@/services/submissions";

const optionalUrl = z.union([z.string().url(), z.literal(""), z.undefined()]).transform((value) => value || undefined);
const schema = z.object({
  name: z.string().trim().min(2).max(60),
  url: z.string().url().max(500),
  tagline: z.string().trim().min(15).max(160),
  launchStatus: z.enum(["live", "beta", "waitlist"]),
  logoUrl: optionalUrl,
  screenshotUrl: optionalUrl,
  demoUrl: optionalUrl,
  founderSocialUrl: optionalUrl,
  safetyConfirmed: z.literal(true),
  turnstileToken: z.string().optional()
});

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const input = schema.parse(await request.json());
    if (!(await verifyTurnstile(input.turnstileToken))) {
      return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
    }
    const startup = await submitStartup({ ...input, userId: user.id });
    return NextResponse.json({ startup }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
