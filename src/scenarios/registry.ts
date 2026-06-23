import type { Decision } from "../index.js";
import type { History, PaymentRequest, Policy, Quote } from "../domain/types.js";
import type { ReasonCode } from "../domain/reason-codes.js";

export interface ScenarioDefinition {
  scenario_id: string;
  title: string;
  description: string;
  category: string;
  risk_represented: string;
  policy: Policy;
  quote: Quote;
  payment_request: PaymentRequest;
  history: History;
  expected_decision: Decision;
  expected_reason_codes: ReasonCode[];
}

const basePolicy: Policy = {
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
  requires_review_above: 5,
  expires_at: "2026-06-30T23:59:59Z",
  max_payments_per_task: 2,
  max_quote_drift_percentage: 10,
  required_metadata: ["idempotency_key", "quote_id"]
};

const baseQuote: Quote = {
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

const baseRequest: PaymentRequest = {
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

const baseHistory: History = {
  task_id: "task_123",
  session_id: "session_123",
  prior_requests: [],
  prior_decisions: [],
  prior_receipts: [],
  total_amount_spent: 0,
  payment_count_for_task: 0,
  used_idempotency_keys: []
};

export const builtInScenarios: ScenarioDefinition[] = [
  scenario({
    scenario_id: "valid-mcp-paid-tool-payment",
    title: "Valid MCP paid tool payment",
    description: "Baseline known-good MCP paid tool payment request.",
    risk_represented: "baseline known-good flow",
    expected_decision: "policy_passed",
    expected_reason_codes: []
  }),
  scenario({
    scenario_id: "amount-exceeds-single-payment-limit",
    title: "Amount exceeds single payment limit",
    description: "Agent attempts a payment above policy limit.",
    risk_represented: "payment above single request limit",
    payment_request: { ...baseRequest, amount: 8 },
    expected_decision: "policy_failed",
    expected_reason_codes: ["amount_exceeds_single_payment_limit"]
  }),
  scenario({
    scenario_id: "cumulative-budget-exceeded",
    title: "Cumulative budget exceeded",
    description: "Request is individually valid but exceeds task budget.",
    risk_represented: "task-level budget overspend",
    history: { ...baseHistory, total_amount_spent: 19 },
    expected_decision: "policy_failed",
    expected_reason_codes: ["cumulative_budget_exceeded"]
  }),
  scenario({
    scenario_id: "blocked-merchant",
    title: "Blocked merchant",
    description: "Payment targets a denied merchant fixture.",
    risk_represented: "payment to blocked merchant",
    payment_request: {
      ...baseRequest,
      merchant: {
        ...baseRequest.merchant,
        merchant_id: "merchant_blocked",
        canonical_merchant_id: "merchant_blocked"
      }
    },
    expected_decision: "policy_failed",
    expected_reason_codes: ["blocked_merchant"]
  }),
  scenario({
    scenario_id: "wrong-token-or-currency",
    title: "Wrong token or currency",
    description: "Request uses the wrong currency.",
    risk_represented: "wrong payment unit",
    payment_request: { ...baseRequest, currency: "EUR", token: "EUR" },
    expected_decision: "policy_failed",
    expected_reason_codes: ["currency_mismatch"]
  }),
  scenario({
    scenario_id: "quote-expired",
    title: "Quote expired",
    description: "Payment request is created after quote expiry.",
    risk_represented: "stale quote acceptance",
    quote: { ...baseQuote, expires_at: "2026-06-23T10:01:00Z" },
    expected_decision: "policy_failed",
    expected_reason_codes: ["quote_expired"]
  }),
  scenario({
    scenario_id: "amount-drift-above-threshold",
    title: "Amount drift above threshold",
    description: "Final amount diverges from quote beyond policy tolerance.",
    risk_represented: "quote amount drift",
    quote: { ...baseQuote, final_amount: 2.5, drift_amount: 0.5, drift_percentage: 25 },
    payment_request: { ...baseRequest, amount: 2.5 },
    expected_decision: "policy_failed",
    expected_reason_codes: ["quote_amount_drift_exceeded"]
  }),
  scenario({
    scenario_id: "duplicate-idempotency-key",
    title: "Duplicate idempotency key",
    description: "Repeated idempotency key creates duplicate charge risk.",
    risk_represented: "duplicate payment attempt",
    history: { ...baseHistory, used_idempotency_keys: ["idem_123"] },
    expected_decision: "policy_failed",
    expected_reason_codes: ["duplicate_idempotency_key"]
  })
];

function scenario(input: {
  scenario_id: string;
  title: string;
  description: string;
  risk_represented: string;
  policy?: Policy;
  quote?: Quote;
  payment_request?: PaymentRequest;
  history?: History;
  expected_decision: Decision;
  expected_reason_codes: ReasonCode[];
}): ScenarioDefinition {
  return {
    category: "must-have",
    policy: input.policy ?? basePolicy,
    quote: input.quote ?? baseQuote,
    payment_request: input.payment_request ?? baseRequest,
    history: input.history ?? baseHistory,
    ...input
  };
}

