import { describe, expect, it } from "vitest";
import { evaluatePaymentRequest } from "../../src/engine/evaluate.js";
import type { History, PaymentRequest, Policy, Quote } from "../../src/domain/types.js";

const policy: Policy = {
  policy_id: "default-agent-payment-policy",
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
    merchant_type: "mcp_server",
    merchant_display_name: "Example MCP Tool"
  },
  amount: 2,
  currency: "USDC",
  token: "USDC",
  chain: "base",
  purpose: "MCP paid tool access",
  tool_source: "mcp://example",
  provider: "mock",
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

describe("evaluatePaymentRequest", () => {
  it("passes a valid request that satisfies policy", () => {
    const result = evaluatePaymentRequest({ policy, quote, request, history });

    expect(result.decision).toBe("policy_passed");
    expect(result.reason_codes).toEqual([]);
  });

  it("fails when amount exceeds the single payment limit", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request: { ...request, amount: 8 },
      history
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("amount_exceeds_single_payment_limit");
  });

  it("fails when cumulative task budget is exceeded", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request,
      history: { ...history, total_amount_spent: 19 }
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("cumulative_budget_exceeded");
  });

  it("fails for blocked merchants before review threshold", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request: {
        ...request,
        amount: 4,
        merchant: {
          ...request.merchant,
          merchant_id: "merchant_blocked",
          canonical_merchant_id: "merchant_blocked"
        }
      },
      history
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("blocked_merchant");
  });

  it("fails when currency does not match policy", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request: { ...request, currency: "EUR", token: "EUR" },
      history
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("currency_mismatch");
  });

  it("fails when the quote is expired before request creation", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote: { ...quote, expires_at: "2026-06-23T10:01:00Z" },
      request,
      history
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("quote_expired");
  });

  it("fails when quote drift exceeds policy threshold", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote: { ...quote, final_amount: 2.5, drift_amount: 0.5, drift_percentage: 25 },
      request: { ...request, amount: 2.5 },
      history
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("quote_amount_drift_exceeded");
  });

  it("fails on duplicate idempotency key from history", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request,
      history: { ...history, used_idempotency_keys: ["idem_123"] }
    });

    expect(result.decision).toBe("policy_failed");
    expect(result.reason_codes).toContain("duplicate_idempotency_key");
  });

  it("requires review when amount exceeds review threshold but no hard rule fails", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote: { ...quote, quoted_amount: 4, final_amount: 4 },
      request: { ...request, amount: 4 },
      history
    });

    expect(result.decision).toBe("requires_review");
    expect(result.reason_codes).toContain("review_threshold_exceeded");
  });

  it("returns invalid_input when required metadata is missing", () => {
    const result = evaluatePaymentRequest({
      policy,
      quote,
      request: { ...request, metadata: { idempotency_key: "idem_123" } },
      history
    });

    expect(result.decision).toBe("invalid_input");
    expect(result.reason_codes).toContain("missing_required_metadata");
  });
});

