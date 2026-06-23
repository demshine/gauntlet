import { dirname, join } from "node:path";
import { buildReceipt } from "../report/receipt.js";
import { buildMarkdownReport } from "../report/markdown.js";
import { evaluatePaymentRequest } from "../engine/evaluate.js";
import { getCiExitCode } from "../engine/decision.js";
import { loadJsonFixture, loadYamlFixture } from "../io/fixtures.js";
import { writeRunArtifacts, type WriteRunArtifactsResult } from "../io/output.js";
import {
  historySchema,
  paymentRequestSchema,
  policySchema,
  quoteSchema
} from "../domain/schemas.js";
import { runBuiltInScenarios, runScenario } from "../scenarios/run.js";
import { builtInScenarios, resolveBuiltInScenarioId } from "../scenarios/registry.js";
import type { Decision } from "../index.js";

export interface RunOptions {
  scenario?: string;
  policy?: string;
  quote?: string;
  request?: string;
  history?: string;
  outputDir?: string;
  ci?: boolean;
  allowReview?: boolean;
  unredacted?: boolean;
}

export interface RunCommandResult {
  stdout: string;
  exitCode: number;
  artifacts?: WriteRunArtifactsResult;
}

export async function executeRun(options: RunOptions): Promise<RunCommandResult> {
  if (options.policy || options.quote || options.request || options.history) {
    return executeCustomRun(options);
  }

  const summary = options.scenario
    ? summarizeSingleScenario(options.scenario)
    : runBuiltInScenarios();
  const stdout = buildMarkdownReport({
    title: "Gauntlet run complete",
    scenarioCount: summary.scenarioCount,
    decisionCounts: summary.decisionCounts,
    advisoryWarningCount: summary.advisoryWarningCount,
    highSignalFailures: summary.highSignalFailures
  });

  const exitCode = options.ci ? getSummaryExitCode(summary.decisionCounts, options) : 0;
  return { stdout, exitCode };
}

async function executeCustomRun(options: RunOptions): Promise<RunCommandResult> {
  if (!options.policy || !options.quote || !options.request) {
    throw new Error("Custom run requires --policy, --quote, and --request.");
  }

  const policy = policySchema.parse(await loadYamlFixture(options.policy));
  const quote = quoteSchema.parse(await loadJsonFixture(options.quote));
  const request = paymentRequestSchema.parse(await loadJsonFixture(options.request));
  const history = options.history
    ? historySchema.parse(await loadJsonFixture(options.history))
    : undefined;

  const evaluation = evaluatePaymentRequest({ policy, quote, request, history });
  const receipt = buildReceipt({
    simulatorVersion: "0.1.0",
    redact: !options.unredacted,
    evaluation,
    snapshots: {
      policy,
      merchant: request.merchant,
      quote,
      payment_request: request
    }
  });

  const decisionCounts = emptyDecisionCounts();
  decisionCounts[evaluation.decision] = 1;
  const stdout = buildMarkdownReport({
    title: "Gauntlet run complete",
    scenarioCount: 1,
    decisionCounts,
    advisoryWarningCount: evaluation.advisory_warnings.length,
    highSignalFailures:
      evaluation.decision === "policy_passed"
        ? []
        : [{ scenarioId: request.request_id, message: evaluation.reason_codes.join(", ") }]
  });

  const outputDir = options.outputDir ?? join(dirname(options.request), "..", "receipts");
  const artifacts = await writeRunArtifacts({
    outputDir,
    receipt,
    reportMarkdown: stdout
  });
  const exitCode = options.ci
    ? getCiExitCode(evaluation.decision, { allowReview: Boolean(options.allowReview) })
    : 0;

  return { stdout, exitCode, artifacts };
}

function summarizeSingleScenario(scenarioId: string) {
  const resolvedScenarioId = resolveBuiltInScenarioId(scenarioId);
  const scenario = builtInScenarios.find(
    (candidate) => candidate.scenario_id === resolvedScenarioId
  );
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  const result = runScenario(scenario);
  const decisionCounts = emptyDecisionCounts();
  decisionCounts[result.evaluation.decision] = 1;

  return {
    scenarioCount: 1,
    results: [result],
    decisionCounts,
    advisoryWarningCount: result.evaluation.advisory_warnings.length,
    highSignalFailures:
      result.evaluation.decision === "policy_passed"
        ? []
        : [
            {
              scenarioId: scenario.scenario_id,
              message: result.evaluation.reason_codes.join(", ")
            }
          ]
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

function getSummaryExitCode(
  decisionCounts: Record<Decision, number>,
  options: Pick<RunOptions, "allowReview">
): number {
  if (decisionCounts.invalid_input > 0) return 2;
  if (decisionCounts.policy_failed > 0) return 1;
  if (decisionCounts.requires_review > 0) return options.allowReview ? 0 : 1;
  return 0;
}
