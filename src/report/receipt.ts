import type { EvaluationResult } from "../engine/evaluate.js";
import type { RuleResult } from "../domain/results.js";
import type { Decision } from "../index.js";
import type { ReasonCode } from "../domain/reason-codes.js";
import { redactSnapshot } from "./redaction.js";

export interface Receipt {
  receipt_id: string;
  trace_id: string;
  scenario_id?: string;
  timestamp: string;
  policy_snapshot: unknown;
  merchant_snapshot: unknown;
  quote_snapshot: unknown;
  payment_request_snapshot: unknown;
  decision: Decision;
  reason_codes: ReasonCode[];
  advisory_warnings: string[];
  evaluation_trace: RuleResult[];
  redaction_policy: "default";
  redacted_fields: string[];
  simulator_version: string;
}

export interface BuildReceiptInput {
  scenarioId?: string;
  simulatorVersion: string;
  evaluation: EvaluationResult;
  redact?: boolean;
  snapshots: {
    policy: unknown;
    merchant: unknown;
    quote: unknown;
    payment_request: unknown;
  };
  timestamp?: string;
}

export function buildReceipt(input: BuildReceiptInput): Receipt {
  const shouldRedact = input.redact ?? true;
  const policy = maybeRedact(input.snapshots.policy, shouldRedact);
  const merchant = maybeRedact(input.snapshots.merchant, shouldRedact);
  const quote = maybeRedact(input.snapshots.quote, shouldRedact);
  const paymentRequest = maybeRedact(input.snapshots.payment_request, shouldRedact);

  return {
    receipt_id: createId("receipt"),
    trace_id: createId("trace"),
    scenario_id: input.scenarioId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    policy_snapshot: policy.snapshot,
    merchant_snapshot: merchant.snapshot,
    quote_snapshot: quote.snapshot,
    payment_request_snapshot: paymentRequest.snapshot,
    decision: input.evaluation.decision,
    reason_codes: input.evaluation.reason_codes,
    advisory_warnings: input.evaluation.advisory_warnings,
    evaluation_trace: input.evaluation.evaluation_trace,
    redaction_policy: "default",
    redacted_fields: [
      ...prefixFields("policy_snapshot", policy.redactedFields),
      ...prefixFields("merchant_snapshot", merchant.redactedFields),
      ...prefixFields("quote_snapshot", quote.redactedFields),
      ...prefixFields("payment_request_snapshot", paymentRequest.redactedFields)
    ],
    simulator_version: input.simulatorVersion
  };
}

function prefixFields(prefix: string, fields: string[]): string[] {
  return fields.map((field) => `${prefix}.${field}`);
}

function maybeRedact(value: unknown, shouldRedact: boolean) {
  if (shouldRedact) {
    return redactSnapshot(value);
  }

  return {
    snapshot: value,
    redactedFields: []
  };
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
