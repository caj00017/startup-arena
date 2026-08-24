import { describe, expect, it } from "vitest";
import {
  buildPaymentSetupSessionParams,
  paymentProviderErrorDetails,
  paymentProviderFailureReason
} from "@/lib/payments";

describe("Stripe payment setup", () => {
  it("provides the currency required by setup-mode dynamic payment methods", () => {
    expect(
      buildPaymentSetupSessionParams({
        customerId: "cus_test",
        userId: "user-test"
      })
    ).toMatchObject({
      mode: "setup",
      currency: "usd",
      customer: "cus_test",
      metadata: { arenaUserId: "user-test" }
    });
  });

  it("does not expose provider error messages or credential fragments", () => {
    const providerError = {
      type: "StripeAuthenticationError",
      code: "api_key_invalid",
      statusCode: 401,
      requestId: "req_test",
      message: "Invalid API Key provided: secret-fragment"
    };

    expect(paymentProviderErrorDetails(providerError)).toEqual({
      type: "StripeAuthenticationError",
      code: "api_key_invalid",
      statusCode: 401,
      requestId: "req_test"
    });
    expect(paymentProviderFailureReason(providerError)).toBe("Stripe authentication failed.");
    expect(JSON.stringify(paymentProviderErrorDetails(providerError))).not.toContain(
      "secret-fragment"
    );
  });
});
