import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function policyExpiryRule(context: RuleContext): RuleResult {
  const passed = new Date(context.request.created_at) <= new Date(context.policy.expires_at);
  return createRuleResult({
    ruleId: "policy_expiry",
    inputFieldsUsed: ["payment_request.created_at", "policy.expires_at"],
    operator: "<=",
    expectedValue: context.policy.expires_at,
    actualValue: context.request.created_at,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "policy_expired",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

