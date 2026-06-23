import type { Decision } from "../index.js";

export function chooseDecision(decisions: Decision[]): Decision {
  if (decisions.includes("invalid_input")) return "invalid_input";
  if (decisions.includes("policy_failed")) return "policy_failed";
  if (decisions.includes("requires_review")) return "requires_review";
  return "policy_passed";
}

export function getCiExitCode(
  decision: Decision,
  options: { allowReview: boolean }
): number {
  if (decision === "policy_passed") return 0;
  if (decision === "requires_review") return options.allowReview ? 0 : 1;
  if (decision === "invalid_input") return 2;
  return 1;
}

