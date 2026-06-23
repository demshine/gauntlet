import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function currencyRule(context: RuleContext): RuleResult {
  const passed = context.request.currency === context.policy.currency;
  return createRuleResult({
    ruleId: "currency",
    inputFieldsUsed: ["payment_request.currency", "policy.currency"],
    operator: "===",
    expectedValue: context.policy.currency,
    actualValue: context.request.currency,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "currency_mismatch",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

