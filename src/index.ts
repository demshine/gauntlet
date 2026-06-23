export type Decision =
  | "policy_passed"
  | "policy_failed"
  | "requires_review"
  | "invalid_input";

export const DECISION_PRECEDENCE: Decision[] = [
  "invalid_input",
  "policy_failed",
  "requires_review",
  "policy_passed"
];

