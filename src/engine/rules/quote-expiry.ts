import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function quoteExpiryRule(context: RuleContext): RuleResult {
  const passed = new Date(context.request.created_at) <= new Date(context.quote.expires_at);
  return createRuleResult({
    ruleId: "quote_expiry",
    inputFieldsUsed: ["payment_request.created_at", "quote.expires_at"],
    operator: "<=",
    expectedValue: context.quote.expires_at,
    actualValue: context.request.created_at,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "quote_expired",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

