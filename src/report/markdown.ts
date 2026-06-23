import type { Decision } from "../index.js";

export interface ReportFailure {
  scenarioId: string;
  message: string;
}

export interface BuildMarkdownReportInput {
  title: string;
  scenarioCount: number;
  decisionCounts: Record<Decision, number>;
  advisoryWarningCount: number;
  highSignalFailures: ReportFailure[];
}

export function buildMarkdownReport(input: BuildMarkdownReportInput): string {
  const lines = [
    `# ${input.title}`,
    "",
    `Scenarios: ${input.scenarioCount}`,
    `Policy passed: ${input.decisionCounts.policy_passed}`,
    `Policy failed: ${input.decisionCounts.policy_failed}`,
    `Requires review: ${input.decisionCounts.requires_review}`,
    `Invalid input: ${input.decisionCounts.invalid_input}`,
    `Advisory warnings: ${input.advisoryWarningCount}`,
    "",
    "## High Signal Failures",
    ""
  ];

  if (input.highSignalFailures.length === 0) {
    lines.push("None.");
  } else {
    lines.push(
      ...input.highSignalFailures.map(
        (failure) => `- ${failure.scenarioId}: ${failure.message}`
      )
    );
  }

  return `${lines.join("\n")}\n`;
}

