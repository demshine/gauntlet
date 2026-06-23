import type { Decision } from "../index.js";
import type { History, PaymentRequest, Policy, Quote } from "../domain/types.js";
import type { ReasonCode } from "../domain/reason-codes.js";
import { createRuleResult, type RuleResult } from "../domain/results.js";
import { chooseDecision } from "./decision.js";

export interface EvaluatePaymentRequestInput {
  policy: Policy;
  quote: Quote;
  request: PaymentRequest;
  history?: History;
}

export interface EvaluationResult {
  decision: Decision;
  reason_codes: ReasonCode[];
  advisory_warnings: string[];
  evaluation_trace: RuleResult[];
}

export function evaluatePaymentRequest(input: EvaluatePaymentRequestInput): EvaluationResult {
  const trace: RuleResult[] = [];

  trace.push(requiredMetadataRule(input.policy, input.request));
  trace.push(maxAmountRule(input.policy, input.request));
  trace.push(cumulativeBudgetRule(input.policy, input.request, input.history));
  trace.push(blockedMerchantRule(input.policy, input.request));
  trace.push(allowedMerchantRule(input.policy, input.request));
  trace.push(currencyRule(input.policy, input.request));
  trace.push(chainRule(input.policy, input.request));
  trace.push(policyExpiryRule(input.policy, input.request));
  trace.push(quoteExpiryRule(input.quote, input.request));
  trace.push(quoteDriftRule(input.policy, input.quote));
  trace.push(idempotencyRule(input.request, input.history));
  trace.push(reviewThresholdRule(input.policy, input.request));

  const failedTrace = trace.filter((result) => result.result === "failed");
  const decisions = failedTrace.map((result) => result.decision_contribution);
  const decision = chooseDecision(decisions);
  const reasonCodes = failedTrace
    .map((result) => result.reason_code)
    .filter((reasonCode): reasonCode is ReasonCode => Boolean(reasonCode));

  return {
    decision,
    reason_codes: reasonCodes,
    advisory_warnings: [],
    evaluation_trace: trace
  };
}

function requiredMetadataRule(policy: Policy, request: PaymentRequest): RuleResult {
  const missing = policy.required_metadata.filter((key) => !(key in request.metadata));
  return createRuleResult({
    ruleId: "required_metadata",
    inputFieldsUsed: ["policy.required_metadata", "payment_request.metadata"],
    operator: "contains_all",
    expectedValue: policy.required_metadata,
    actualValue: Object.keys(request.metadata),
    passed: missing.length === 0,
    severity: "error",
    reasonCode: missing.length > 0 ? "missing_required_metadata" : undefined,
    decisionContribution: missing.length > 0 ? "invalid_input" : "policy_passed"
  });
}

function maxAmountRule(policy: Policy, request: PaymentRequest): RuleResult {
  const passed = request.amount <= policy.max_amount_per_payment;
  return createRuleResult({
    ruleId: "max_amount_per_payment",
    inputFieldsUsed: ["payment_request.amount", "policy.max_amount_per_payment"],
    operator: "<=",
    expectedValue: policy.max_amount_per_payment,
    actualValue: request.amount,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "amount_exceeds_single_payment_limit",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function cumulativeBudgetRule(
  policy: Policy,
  request: PaymentRequest,
  history?: History
): RuleResult {
  const total = (history?.total_amount_spent ?? 0) + request.amount;
  const passed = total <= policy.max_total_budget;
  return createRuleResult({
    ruleId: "max_total_budget",
    inputFieldsUsed: ["history.total_amount_spent", "payment_request.amount", "policy.max_total_budget"],
    operator: "<=",
    expectedValue: policy.max_total_budget,
    actualValue: total,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "cumulative_budget_exceeded",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function blockedMerchantRule(policy: Policy, request: PaymentRequest): RuleResult {
  const merchantIds = merchantMatchValues(request);
  const blocked = merchantIds.some((merchantId) => policy.blocked_merchants.includes(merchantId));
  return createRuleResult({
    ruleId: "blocked_merchants",
    inputFieldsUsed: ["payment_request.merchant", "policy.blocked_merchants"],
    operator: "not_in",
    expectedValue: policy.blocked_merchants,
    actualValue: merchantIds,
    passed: !blocked,
    severity: "error",
    reasonCode: blocked ? "blocked_merchant" : undefined,
    decisionContribution: blocked ? "policy_failed" : "policy_passed"
  });
}

function allowedMerchantRule(policy: Policy, request: PaymentRequest): RuleResult {
  const merchantIds = merchantMatchValues(request);
  const allowed = merchantIds.some((merchantId) => policy.allowed_merchants.includes(merchantId));
  return createRuleResult({
    ruleId: "allowed_merchants",
    inputFieldsUsed: ["payment_request.merchant", "policy.allowed_merchants"],
    operator: "in",
    expectedValue: policy.allowed_merchants,
    actualValue: merchantIds,
    passed: allowed,
    severity: "error",
    reasonCode: allowed ? undefined : "merchant_not_allowed",
    decisionContribution: allowed ? "policy_passed" : "policy_failed"
  });
}

function currencyRule(policy: Policy, request: PaymentRequest): RuleResult {
  const passed = request.currency === policy.currency;
  return createRuleResult({
    ruleId: "currency",
    inputFieldsUsed: ["payment_request.currency", "policy.currency"],
    operator: "===",
    expectedValue: policy.currency,
    actualValue: request.currency,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "currency_mismatch",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function chainRule(policy: Policy, request: PaymentRequest): RuleResult {
  const passed = !policy.chain || request.chain === policy.chain;
  return createRuleResult({
    ruleId: "chain",
    inputFieldsUsed: ["payment_request.chain", "policy.chain"],
    operator: "===",
    expectedValue: policy.chain,
    actualValue: request.chain,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "chain_mismatch",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function policyExpiryRule(policy: Policy, request: PaymentRequest): RuleResult {
  const passed = new Date(request.created_at) <= new Date(policy.expires_at);
  return createRuleResult({
    ruleId: "policy_expiry",
    inputFieldsUsed: ["payment_request.created_at", "policy.expires_at"],
    operator: "<=",
    expectedValue: policy.expires_at,
    actualValue: request.created_at,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "policy_expired",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function quoteExpiryRule(quote: Quote, request: PaymentRequest): RuleResult {
  const passed = new Date(request.created_at) <= new Date(quote.expires_at);
  return createRuleResult({
    ruleId: "quote_expiry",
    inputFieldsUsed: ["payment_request.created_at", "quote.expires_at"],
    operator: "<=",
    expectedValue: quote.expires_at,
    actualValue: request.created_at,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "quote_expired",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function quoteDriftRule(policy: Policy, quote: Quote): RuleResult {
  const passed = quote.drift_percentage <= policy.max_quote_drift_percentage;
  return createRuleResult({
    ruleId: "quote_amount_drift",
    inputFieldsUsed: ["quote.drift_percentage", "policy.max_quote_drift_percentage"],
    operator: "<=",
    expectedValue: policy.max_quote_drift_percentage,
    actualValue: quote.drift_percentage,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "quote_amount_drift_exceeded",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

function idempotencyRule(request: PaymentRequest, history?: History): RuleResult {
  const duplicate = history?.used_idempotency_keys.includes(request.idempotency_key) ?? false;
  return createRuleResult({
    ruleId: "duplicate_idempotency_key",
    inputFieldsUsed: ["payment_request.idempotency_key", "history.used_idempotency_keys"],
    operator: "not_in",
    expectedValue: history?.used_idempotency_keys ?? [],
    actualValue: request.idempotency_key,
    passed: !duplicate,
    severity: "error",
    reasonCode: duplicate ? "duplicate_idempotency_key" : undefined,
    decisionContribution: duplicate ? "policy_failed" : "policy_passed"
  });
}

function reviewThresholdRule(policy: Policy, request: PaymentRequest): RuleResult {
  const passed = request.amount <= policy.requires_review_above;
  return createRuleResult({
    ruleId: "review_threshold",
    inputFieldsUsed: ["payment_request.amount", "policy.requires_review_above"],
    operator: "<=",
    expectedValue: policy.requires_review_above,
    actualValue: request.amount,
    passed,
    severity: "review",
    reasonCode: passed ? undefined : "review_threshold_exceeded",
    decisionContribution: passed ? "policy_passed" : "requires_review"
  });
}

function merchantMatchValues(request: PaymentRequest): string[] {
  return [
    request.merchant.merchant_id,
    request.merchant.canonical_merchant_id,
    request.merchant.merchant_domain,
    request.merchant.merchant_wallet_address
  ].filter((value): value is string => Boolean(value));
}

