import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function reviewThresholdRule(context: RuleContext): RuleResult {
  const passed = context.request.amount <= context.policy.requires_review_above;
  return createRuleResult({
    ruleId: "review_threshold",
    inputFieldsUsed: ["payment_request.amount", "policy.requires_review_above"],
    operator: "<=",
    expectedValue: context.policy.requires_review_above,
    actualValue: context.request.amount,
    passed,
    severity: "review",
    reasonCode: passed ? undefined : "review_threshold_exceeded",
    decisionContribution: passed ? "policy_passed" : "requires_review"
  });
}

