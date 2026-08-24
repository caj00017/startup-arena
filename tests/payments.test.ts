import { describe, expect, it } from "vitest";
import { buildPaymentSetupSessionParams } from "@/lib/payments";

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
});
