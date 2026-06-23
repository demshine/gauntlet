import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function quoteDriftRule(context: RuleContext): RuleResult {
  const passed = context.quote.drift_percentage <= context.policy.max_quote_drift_percentage;
  return createRuleResult({
    ruleId: "quote_amount_drift",
    inputFieldsUsed: ["quote.drift_percentage", "policy.max_quote_drift_percentage"],
    operator: "<=",
    expectedValue: context.policy.max_quote_drift_percentage,
    actualValue: context.quote.drift_percentage,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "quote_amount_drift_exceeded",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

