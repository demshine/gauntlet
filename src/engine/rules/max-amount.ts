import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function maxAmountRule(context: RuleContext): RuleResult {
  const passed = context.request.amount <= context.policy.max_amount_per_payment;
  return createRuleResult({
    ruleId: "max_amount_per_payment",
    inputFieldsUsed: ["payment_request.amount", "policy.max_amount_per_payment"],
    operator: "<=",
    expectedValue: context.policy.max_amount_per_payment,
    actualValue: context.request.amount,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "amount_exceeds_single_payment_limit",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

