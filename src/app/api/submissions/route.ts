import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, unauthorized } from "@/lib/http";
import { assertSameOrigin, verifyTurnstile } from "@/lib/security";
import {
  getSubmissionValidationMessage,
  submissionInputSchema
} from "@/lib/submission-validation";
import { submitStartup } from "@/services/submissions";

export async function POST(request: Request) {
  try {
    await assertSameOrigin(request);
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    const parsedInput = submissionInputSchema.safeParse(await request.json());
    if (!parsedInput.success) {
      return NextResponse.json(
        { error: getSubmissionValidationMessage(parsedInput.error) },
        { status: 400 }
      );
    }
    const input = parsedInput.data;
    if (!(await verifyTurnstile(input.turnstileToken))) {
      return NextResponse.json({ error: "Bot verification failed." }, { status: 400 });
    }
    const startup = await submitStartup({ ...input, userId: user.id });
    return NextResponse.json({ startup }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
