import { createRuleResult, type RuleResult } from "../../domain/results.js";
import type { RuleContext } from "./context.js";

export function chainRule(context: RuleContext): RuleResult {
  const passed = !context.policy.chain || context.request.chain === context.policy.chain;
  return createRuleResult({
    ruleId: "chain",
    inputFieldsUsed: ["payment_request.chain", "policy.chain"],
    operator: "===",
    expectedValue: context.policy.chain,
    actualValue: context.request.chain,
    passed,
    severity: "error",
    reasonCode: passed ? undefined : "chain_mismatch",
    decisionContribution: passed ? "policy_passed" : "policy_failed"
  });
}

