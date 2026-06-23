import { describe, expect, it } from "vitest";
import { createRuleResult } from "../../src/domain/results.js";

describe("createRuleResult", () => {
  it("creates a stable evaluation trace entry", () => {
    const result = createRuleResult({
      ruleId: "max_amount_per_payment",
      inputFieldsUsed: ["payment_request.amount", "policy.max_amount_per_payment"],
      operator: "<=",
      expectedValue: 5,
      actualValue: 8,
      passed: false,
      severity: "error",
      reasonCode: "amount_exceeds_single_payment_limit",
      decisionContribution: "policy_failed"
    });

    expect(result).toMatchObject({
      rule_id: "max_amount_per_payment",
      rule_version: 1,
      result: "failed",
      reason_code: "amount_exceeds_single_payment_limit",
      decision_contribution: "policy_failed"
    });
  });
});

