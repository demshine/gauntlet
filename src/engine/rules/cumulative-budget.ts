import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function cumulativeBudgetRule(context: RuleContext): RuleResult {
  const total = (context.history?.total_amount_spent ?? 0) + context.request.amount;
  const passed = total <= context.policy.max_total_budget;
  return createRuleResult({
    ruleId: "max_total_budget",
    inputFieldsUsed: [
      "history.total_amount_spent",
      "payment_request.amount",
      "policy.max_total_budget"
    ],
    operator: "<=",
    expectedValue: context.policy.max_total_budget,
    actualValue: total,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "cumulative_budget_exceeded",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

