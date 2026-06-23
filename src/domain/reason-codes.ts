export const REASON_CODES = [
  "amount_exceeds_single_payment_limit",
  "cumulative_budget_exceeded",
  "blocked_merchant",
  "merchant_not_allowed",
  "currency_mismatch",
  "token_mismatch",
  "chain_mismatch",
  "policy_expired",
  "quote_expired",
  "quote_amount_drift_exceeded",
  "duplicate_idempotency_key",
  "missing_required_field",
  "missing_required_metadata",
  "review_threshold_exceeded"
] as const;

export type ReasonCode = (typeof REASON_CODES)[number];

