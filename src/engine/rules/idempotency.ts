import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function idempotencyRule(context: RuleContext): RuleResult {
  const duplicate =
    context.history?.used_idempotency_keys.includes(context.request.idempotency_key) ?? false;
  return createRuleResult({
    ruleId: "duplicate_idempotency_key",
    inputFieldsUsed: ["payment_request.idempotency_key", "history.used_idempotency_keys"],
    operator: "not_in",
    expectedValue: context.history?.used_idempotency_keys ?? [],
    actualValue: context.request.idempotency_key,
    passed: !duplicate,
    severity: "error",
    reasonCode: duplicate ? "duplicate_idempotency_key" : undefined,
    decisionContribution: duplicate ? "policy_failed" : "policy_passed"
  });
}

