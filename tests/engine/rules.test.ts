import { describe, expect, it } from "vitest";
import type { History, PaymentRequest, Policy, Quote } from "../../src/domain/types.js";
import { maxAmountRule } from "../../src/engine/rules/max-amount.js";
import { merchantMatchRules } from "../../src/engine/rules/merchant-match.js";
import { quoteExpiryRule } from "../../src/engine/rules/quote-expiry.js";
import { reviewThresholdRule } from "../../src/engine/rules/review-threshold.js";

const policy: Policy = {
  policy_id: "policy_123",
  version: 1,
  agent_id: "research-agent",
  max_amount_per_payment: 5,
  max_total_budget: 20,
  budget_window: "task",
  currency: "USDC",
  chain: "base",
  allowed_merchants: ["merchant_api_example"],
  blocked_merchants: ["merchant_blocked"],
  requires_review_above: 3,
  expires_at: "2026-06-30T23:59:59Z",
  max_payments_per_task: 2,
  max_quote_drift_percentage: 10,
  required_metadata: ["idempotency_key", "quote_id"]
};

const quote: Quote = {
  quote_id: "quote_123",
  merchant_id: "merchant_api_example",
  quoted_amount: 2,
  quoted_currency: "USDC",
  quoted_at: "2026-06-23T10:00:00Z",
  expires_at: "2026-06-23T10:10:00Z",
  item_description: "MCP paid tool access",
  final_amount: 2,
  drift_amount: 0,
  drift_percentage: 0
};

const request: PaymentRequest = {
  request_id: "req_123",
  task_id: "task_123",
  session_id: "session_123",
  idempotency_key: "idem_123",
  retry_count: 0,
  quote_id: "quote_123",
  agent_id: "research-agent",
  merchant: {
    merchant_id: "merchant_api_example",
    canonical_merchant_id: "merchant_api_example",
    merchant_type: "mcp_server"
  },
  amount: 2,
  currency: "USDC",
  token: "USDC",
  chain: "base",
  created_at: "2026-06-23T10:05:00Z",
  metadata: {
    idempotency_key: "idem_123",
    quote_id: "quote_123"
  }
};

const history: History = {
  task_id: "task_123",
  session_id: "session_123",
  prior_requests: [],
  prior_decisions: [],
  prior_receipts: [],
  total_amount_spent: 0,
  payment_count_for_task: 0,
  used_idempotency_keys: []
};

describe("deterministic rule modules", () => {
  it("maxAmountRule emits policy failure for over-limit payments", () => {
    const result = maxAmountRule({
      policy,
      quote,
      request: { ...request, amount: 8 },
      history
    });

    expect(result).toMatchObject({
      rule_id: "max_amount_per_payment",
      result: "failed",
      reason_code: "amount_exceeds_single_payment_limit",
      decision_contribution: "policy_failed"
    });
  });

  it("merchantMatchRules emits blocked merchant before allowlist issues", () => {
    const results = merchantMatchRules({
      policy,
      quote,
      request: {
        ...request,
        merchant: {
          ...request.merchant,
          merchant_id: "merchant_blocked",
          canonical_merchant_id: "merchant_blocked"
        }
      },
      history
    });

    expect(results.map((result) => result.reason_code)).toContain("blocked_merchant");
  });

  it("quoteExpiryRule fails when request is created after quote expiry", () => {
    const result = quoteExpiryRule({
      policy,
      quote: { ...quote, expires_at: "2026-06-23T10:01:00Z" },
      request,
      history
    });

    expect(result.reason_code).toBe("quote_expired");
  });

  it("reviewThresholdRule contributes requires_review above threshold", () => {
    const result = reviewThresholdRule({
      policy,
      quote,
      request: { ...request, amount: 4 },
      history
    });

    expect(result).toMatchObject({
      result: "failed",
      reason_code: "review_threshold_exceeded",
      decision_contribution: "requires_review"
    });
  });
});

