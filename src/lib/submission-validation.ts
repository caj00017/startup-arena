import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().url().max(500).optional()
);

export const submissionInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  url: z.string().url().max(500),
  tagline: z.string().trim().min(15).max(160),
  launchStatus: z.enum(["live", "beta", "waitlist"]),
  logoUrl: optionalUrl,
  screenshotUrl: optionalUrl,
  demoUrl: optionalUrl,
  founderSocialUrl: optionalUrl,
  safetyConfirmed: z.literal(true),
  turnstileToken: z.string().max(2_048).optional()
});

const fieldMessages: Record<string, string> = {
  name: "Startup name must be between 2 and 60 characters.",
  url: "Enter a valid product URL.",
  tagline: "The pitch must be between 15 and 160 characters.",
  launchStatus: "Choose a valid product status.",
  logoUrl: "Enter a valid logo URL or leave it blank.",
  screenshotUrl: "Enter a valid screenshot URL or leave it blank.",
  demoUrl: "Enter a valid demo URL or leave it blank.",
  founderSocialUrl: "Enter a valid founder social URL or leave it blank.",
  safetyConfirmed: "Confirm that the product is safe to submit.",
  turnstileToken: "Bot verification expired. Complete it again."
};

export function getSubmissionValidationMessage(error: z.ZodError) {
  const field = error.issues[0]?.path[0];
  return typeof field === "string"
    ? fieldMessages[field] || "Review the submission fields and try again."
    : "Review the submission fields and try again.";
}
