import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function requiredMetadataRule(context: RuleContext): RuleResult {
  const missing = context.policy.required_metadata.filter(
    (key) => !(key in context.request.metadata)
  );
  return createRuleResult({
    ruleId: "required_metadata",
    inputFieldsUsed: ["policy.required_metadata", "payment_request.metadata"],
    operator: "contains_all",
    expectedValue: context.policy.required_metadata,
    actualValue: Object.keys(context.request.metadata),
    passed: missing.length === 0,
    severity: "error",
    reasonCode: missing.length > 0 ? "missing_required_metadata" : undefined,
    decisionContribution: missing.length > 0 ? "invalid_input" : "policy_passed"
  });
}

