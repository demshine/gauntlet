import { describe, expect, it } from "vitest";
import { buildReceipt } from "../../src/report/receipt.js";
import type { EvaluationResult } from "../../src/engine/evaluate.js";

describe("buildReceipt", () => {
  it("builds a redacted receipt with evaluation trace", () => {
    const evaluation: EvaluationResult = {
      decision: "policy_failed",
      reason_codes: ["quote_expired"],
      advisory_warnings: [],
      evaluation_trace: [
        {
          rule_id: "quote_expiry",
          rule_version: 1,
          input_fields_used: ["payment_request.created_at", "quote.expires_at"],
          operator: "<=",
          expected_value: "2026-06-23T10:01:00Z",
          actual_value: "2026-06-23T10:05:00Z",
          result: "failed",
          severity: "error",
          reason_code: "quote_expired",
          decision_contribution: "policy_failed"
        }
      ]
    };

    const receipt = buildReceipt({
      scenarioId: "quote-expired",
      simulatorVersion: "0.1.0",
      evaluation,
      snapshots: {
        policy: { policy_id: "policy_123" },
        merchant: { merchant_id: "merchant_api_example" },
        quote: { quote_id: "quote_123" },
        payment_request: {
          request_id: "req_123",
          provider_transaction_reference: "txn_secret"
        }
      }
    });

    expect(receipt.decision).toBe("policy_failed");
    expect(receipt.reason_codes).toEqual(["quote_expired"]);
    expect(receipt.payment_request_snapshot).toMatchObject({
      provider_transaction_reference: "[REDACTED]"
    });
    expect(receipt.redacted_fields).toContain(
      "payment_request_snapshot.provider_transaction_reference"
    );
    expect(receipt.evaluation_trace).toHaveLength(1);
  });
});

