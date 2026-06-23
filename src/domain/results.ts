import type { Decision } from "../index.js";
import type { ReasonCode } from "./reason-codes.js";

export type RuleSeverity = "error" | "review" | "info";
export type RuleOutcome = "passed" | "failed";

export interface RuleResult {
  rule_id: string;
  rule_version: number;
  input_fields_used: string[];
  operator: string;
  expected_value: unknown;
  actual_value: unknown;
  result: RuleOutcome;
  severity: RuleSeverity;
  reason_code?: ReasonCode;
  decision_contribution: Decision;
}

export interface CreateRuleResultInput {
  ruleId: string;
  ruleVersion?: number;
  inputFieldsUsed: string[];
  operator: string;
  expectedValue: unknown;
  actualValue: unknown;
  passed: boolean;
  severity: RuleSeverity;
  reasonCode?: ReasonCode;
  decisionContribution: Decision;
}

export function createRuleResult(input: CreateRuleResultInput): RuleResult {
  return {
    rule_id: input.ruleId,
    rule_version: input.ruleVersion ?? 1,
    input_fields_used: input.inputFieldsUsed,
    operator: input.operator,
    expected_value: input.expectedValue,
    actual_value: input.actualValue,
    result: input.passed ? "passed" : "failed",
    severity: input.severity,
    reason_code: input.reasonCode,
    decision_contribution: input.decisionContribution
  };
}

