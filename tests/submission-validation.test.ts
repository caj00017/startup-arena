import { describe, expect, it } from "vitest";
import {
  getSubmissionValidationMessage,
  submissionInputSchema
} from "@/lib/submission-validation";

const validSubmission = {
  name: "Arena Champion Test",
  url: "https://example.com/arena-champion",
  tagline: "Arena Champion Test Description",
  launchStatus: "beta",
  safetyConfirmed: true,
  turnstileToken: "test-token"
};

describe("startup submission validation", () => {
  it("accepts a submission with all optional URLs omitted", () => {
    expect(submissionInputSchema.safeParse(validSubmission).success).toBe(true);
  });

  it("normalizes blank optional URLs to undefined", () => {
    const result = submissionInputSchema.safeParse({
      ...validSubmission,
      logoUrl: "",
      screenshotUrl: "",
      demoUrl: "",
      founderSocialUrl: ""
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        logoUrl: undefined,
        screenshotUrl: undefined,
        demoUrl: undefined,
        founderSocialUrl: undefined
      });
    }
  });

  it("returns an actionable message for an invalid optional URL", () => {
    const result = submissionInputSchema.safeParse({
      ...validSubmission,
      logoUrl: "not-a-url"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(getSubmissionValidationMessage(result.error)).toBe(
        "Enter a valid logo URL or leave it blank."
      );
    }
  });
});
