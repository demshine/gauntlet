import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function merchantMatchRules(context: RuleContext): RuleResult[] {
  return [blockedMerchantRule(context), allowedMerchantRule(context)];
}

function blockedMerchantRule(context: RuleContext): RuleResult {
  const merchantIds = merchantMatchValues(context);
  const blocked = merchantIds.some((merchantId) =>
    context.policy.blocked_merchants.includes(merchantId)
  );
  return createRuleResult({
    ruleId: "blocked_merchants",
    inputFieldsUsed: ["payment_request.merchant", "policy.blocked_merchants"],
    operator: "not_in",
    expectedValue: context.policy.blocked_merchants,
    actualValue: merchantIds,
    passed: !blocked,
    severity: "error",
    reasonCode: blocked ? "blocked_merchant" : undefined,
    decisionContribution: blocked ? "policy_failed" : "policy_passed"
  });
}

function allowedMerchantRule(context: RuleContext): RuleResult {
  const merchantIds = merchantMatchValues(context);
  const allowed = merchantIds.some((merchantId) =>
    context.policy.allowed_merchants.includes(merchantId)
  );
  return createRuleResult({
    ruleId: "allowed_merchants",
    inputFieldsUsed: ["payment_request.merchant", "policy.allowed_merchants"],
    operator: "in",
    expectedValue: context.policy.allowed_merchants,
    actualValue: merchantIds,
    passed: allowed,
    severity: "error",
    reasonCode: allowed ? undefined : "merchant_not_allowed",
    decisionContribution: allowed ? "policy_passed" : "policy_failed"
  });
}

function merchantMatchValues(context: RuleContext): string[] {
  return [
    context.request.merchant.merchant_id,
    context.request.merchant.canonical_merchant_id,
    context.request.merchant.merchant_domain,
    context.request.merchant.merchant_wallet_address
  ].filter((value): value is string => Boolean(value));
}

