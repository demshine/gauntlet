import type { ReasonCode } from "../domain/reason-codes.js";
import { runScenario } from "./run.js";
import type { ScenarioDefinition } from "./registry.js";

export type ScenarioValidationIssueCode =
  | "expected_decision_mismatch"
  | "expected_reason_code_missing";

export interface ScenarioValidationIssue {
  scenarioId: string;
  code: ScenarioValidationIssueCode;
  message: string;
}

export function validateScenarios(
  scenarios: ScenarioDefinition[]
): ScenarioValidationIssue[] {
  return scenarios.flatMap((scenario) => validateScenario(scenario));
}

export function validateScenario(
  scenario: ScenarioDefinition
): ScenarioValidationIssue[] {
  const result = runScenario(scenario);
  const issues: ScenarioValidationIssue[] = [];

  if (result.evaluation.decision !== scenario.expected_decision) {
    issues.push({
      scenarioId: scenario.scenario_id,
      code: "expected_decision_mismatch",
      message: `Expected ${scenario.expected_decision}, got ${result.evaluation.decision}.`
    });
  }

  for (const reasonCode of scenario.expected_reason_codes) {
    if (!result.evaluation.reason_codes.includes(reasonCode)) {
      issues.push(missingReasonCodeIssue(scenario, reasonCode));
    }
  }

  return issues;
}

function missingReasonCodeIssue(
  scenario: ScenarioDefinition,
  reasonCode: ReasonCode
): ScenarioValidationIssue {
  return {
    scenarioId: scenario.scenario_id,
    code: "expected_reason_code_missing",
    message: `Expected reason code ${reasonCode} was not emitted.`
  };
}

