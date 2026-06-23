import type { Decision } from "../index.js";
import type { ReasonCode } from "../domain/reason-codes.js";
import { evaluatePaymentRequest, type EvaluationResult } from "../engine/evaluate.js";
import { builtInScenarios, type ScenarioDefinition } from "./registry.js";

export interface ScenarioRunResult {
  scenario: ScenarioDefinition;
  evaluation: EvaluationResult;
  matched_expectation: boolean;
}

export interface ScenarioRunSummary {
  scenarioCount: number;
  results: ScenarioRunResult[];
  decisionCounts: Record<Decision, number>;
  advisoryWarningCount: number;
  highSignalFailures: Array<{
    scenarioId: string;
    message: string;
  }>;
}

export function runBuiltInScenarios(): ScenarioRunSummary {
  return summarizeScenarioResults(
    builtInScenarios.map((scenario) => runScenario(scenario))
  );
}

export function runScenario(scenario: ScenarioDefinition): ScenarioRunResult {
  const evaluation = evaluatePaymentRequest({
    policy: scenario.policy,
    quote: scenario.quote,
    request: scenario.payment_request,
    history: scenario.history
  });

  return {
    scenario,
    evaluation,
    matched_expectation:
      evaluation.decision === scenario.expected_decision &&
      includesExpectedReasonCodes(evaluation.reason_codes, scenario.expected_reason_codes)
  };
}

function summarizeScenarioResults(results: ScenarioRunResult[]): ScenarioRunSummary {
  const decisionCounts = emptyDecisionCounts();
  let advisoryWarningCount = 0;
  const highSignalFailures: ScenarioRunSummary["highSignalFailures"] = [];

  for (const result of results) {
    decisionCounts[result.evaluation.decision] += 1;
    advisoryWarningCount += result.evaluation.advisory_warnings.length;

    if (result.evaluation.decision !== "policy_passed") {
      highSignalFailures.push({
        scenarioId: result.scenario.scenario_id,
        message: describeFailure(result.evaluation.reason_codes)
      });
    }
  }

  return {
    scenarioCount: results.length,
    results,
    decisionCounts,
    advisoryWarningCount,
    highSignalFailures
  };
}

function emptyDecisionCounts(): Record<Decision, number> {
  return {
    policy_passed: 0,
    policy_failed: 0,
    requires_review: 0,
    invalid_input: 0
  };
}

function includesExpectedReasonCodes(actual: ReasonCode[], expected: ReasonCode[]): boolean {
  return expected.every((reasonCode) => actual.includes(reasonCode));
}

function describeFailure(reasonCodes: ReasonCode[]): string {
  return reasonCodes.length > 0 ? reasonCodes.join(", ") : "no reason code";
}

