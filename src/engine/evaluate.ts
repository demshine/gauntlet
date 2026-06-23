import type { Decision } from "../index.js";
import type { History, PaymentRequest, Policy, Quote } from "../domain/types.js";
import type { ReasonCode } from "../domain/reason-codes.js";
import type { RuleResult } from "../domain/results.js";
import { chooseDecision } from "./decision.js";
import { evaluateRules } from "./rules/index.js";

export interface EvaluatePaymentRequestInput {
  policy: Policy;
  quote: Quote;
  request: PaymentRequest;
  history?: History;
}

export interface EvaluationResult {
  decision: Decision;
  reason_codes: ReasonCode[];
  advisory_warnings: string[];
  evaluation_trace: RuleResult[];
}

export function evaluatePaymentRequest(input: EvaluatePaymentRequestInput): EvaluationResult {
  const trace = evaluateRules({
    policy: input.policy,
    quote: input.quote,
    request: input.request,
    history: input.history
  });

  const failedTrace = trace.filter((result) => result.result === "failed");
  const decisions = failedTrace.map((result) => result.decision_contribution);
  const decision = chooseDecision(decisions);
  const reasonCodes = failedTrace
    .map((result) => result.reason_code)
    .filter((reasonCode): reasonCode is ReasonCode => Boolean(reasonCode));

  return {
    decision,
    reason_codes: reasonCodes,
    advisory_warnings: [],
    evaluation_trace: trace
  };
}
