import { z } from "zod";

const isoDateTime = z.string().datetime({ offset: true });

export const merchantTypeSchema = z.enum([
  "domain",
  "api_endpoint",
  "mcp_server",
  "wallet_address",
  "smart_contract",
  "stripe_merchant",
  "card_descriptor",
  "organization",
  "unknown"
]);

export const merchantSchema = z.object({
  merchant_id: z.string().min(1),
  canonical_merchant_id: z.string().min(1),
  merchant_type: merchantTypeSchema,
  merchant_domain: z.string().min(1).optional(),
  merchant_wallet_address: z.string().min(1).optional(),
  merchant_provider_id: z.string().min(1).optional(),
  merchant_display_name: z.string().min(1).optional()
});

export const policySchema = z.object({
  policy_id: z.string().min(1),
  version: z.number().int().positive(),
  agent_id: z.string().min(1),
  max_amount_per_payment: z.number().nonnegative(),
  max_total_budget: z.number().nonnegative(),
  budget_window: z.literal("task"),
  currency: z.string().min(1),
  chain: z.string().min(1).optional(),
  allowed_merchants: z.array(z.string().min(1)),
  blocked_merchants: z.array(z.string().min(1)),
  requires_review_above: z.number().nonnegative(),
  expires_at: isoDateTime,
  max_payments_per_task: z.number().int().nonnegative(),
  max_quote_drift_percentage: z.number().nonnegative(),
  required_metadata: z.array(z.string().min(1))
});

export const quoteSchema = z.object({
  quote_id: z.string().min(1),
  merchant_id: z.string().min(1),
  quoted_amount: z.number().nonnegative(),
  quoted_currency: z.string().min(1),
  quoted_at: isoDateTime,
  expires_at: isoDateTime,
  item_description: z.string().min(1),
  final_amount: z.number().nonnegative(),
  drift_amount: z.number(),
  drift_percentage: z.number()
});

export const paymentRequestSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    request_id: z.string().min(1),
    task_id: z.string().min(1),
    session_id: z.string().min(1),
    idempotency_key: z.string().min(1),
    original_request_id: z.string().min(1).optional(),
    retry_count: z.number().int().nonnegative(),
    previous_decision_id: z.string().min(1).optional(),
    provider_request_id: z.string().min(1).optional(),
    provider_transaction_reference: z.string().min(1).optional(),
    merchant_order_id: z.string().min(1).optional(),
    payment_session_id: z.string().min(1).optional(),
    quote_id: z.string().min(1),
    price_quote_expires_at: isoDateTime.optional(),
    agent_id: z.string().min(1),
    merchant: merchantSchema,
    amount: z.number().nonnegative(),
    currency: z.string().min(1),
    token: z.string().min(1).optional(),
    chain: z.string().min(1).optional(),
    purpose: z.string().optional(),
    tool_source: z.string().optional(),
    provider: z.string().optional(),
    created_at: isoDateTime,
    metadata: z.record(z.string(), z.unknown())
  })
);

export const decisionSchema = z.enum([
  "policy_passed",
  "policy_failed",
  "requires_review",
  "invalid_input"
]);

export const historySchema = z.object({
  task_id: z.string().min(1),
  session_id: z.string().min(1),
  prior_requests: z.array(paymentRequestSchema),
  prior_decisions: z.array(decisionSchema),
  prior_receipts: z.array(z.string().min(1)),
  total_amount_spent: z.number().nonnegative(),
  payment_count_for_task: z.number().int().nonnegative(),
  used_idempotency_keys: z.array(z.string().min(1))
});

export const scenarioSchema = z.object({
  scenario_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  risk_represented: z.string().min(1),
  policy: policySchema,
  merchant: merchantSchema,
  quote: quoteSchema,
  payment_request: paymentRequestSchema,
  history: historySchema.optional(),
  expected_decision: decisionSchema,
  expected_reason_codes: z.array(z.string().min(1)),
  advisory_expectations: z.array(z.string()).default([])
});

export type PolicyFixture = z.infer<typeof policySchema>;
export type MerchantFixture = z.infer<typeof merchantSchema>;
export type QuoteFixture = z.infer<typeof quoteSchema>;
export type HistoryFixture = z.infer<typeof historySchema>;
export type ScenarioFixture = z.infer<typeof scenarioSchema>;

