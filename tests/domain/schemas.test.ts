import { describe, expect, it } from "vitest";
import { policySchema } from "../../src/domain/schemas.js";

describe("policySchema", () => {
  it("accepts a valid V0.1 policy fixture", () => {
    const result = policySchema.safeParse({
      policy_id: "default-agent-payment-policy",
      version: 1,
      agent_id: "research-agent",
      max_amount_per_payment: 5,
      max_total_budget: 20,
      budget_window: "task",
      currency: "USDC",
      chain: "base",
      allowed_merchants: ["merchant_api_example"],
      blocked_merchants: ["merchant_unknown"],
      requires_review_above: 3,
      expires_at: "2026-06-30T23:59:59Z",
      max_payments_per_task: 2,
      max_quote_drift_percentage: 10,
      required_metadata: ["idempotency_key", "quote_id"]
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required policy fields", () => {
    const result = policySchema.safeParse({
      policy_id: "default-agent-payment-policy"
    });

    expect(result.success).toBe(false);
  });
});

