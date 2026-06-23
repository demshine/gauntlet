import { describe, expect, it } from "vitest";
import { redactSnapshot } from "../../src/report/redaction.js";

describe("redactSnapshot", () => {
  it("redacts sensitive payment request fields by default", () => {
    const result = redactSnapshot({
      request_id: "req_123",
      provider_transaction_reference: "txn_secret",
      merchant_order_id: "order_secret",
      purpose: "buy private dataset",
      metadata: {
        idempotency_key: "idem_123",
        api_key: "sk_secret",
        quote_id: "quote_123"
      }
    });

    expect(result.snapshot).toMatchObject({
      request_id: "req_123",
      provider_transaction_reference: "[REDACTED]",
      merchant_order_id: "[REDACTED]",
      purpose: "[REDACTED]",
      metadata: {
        idempotency_key: "idem_123",
        api_key: "[REDACTED]",
        quote_id: "quote_123"
      }
    });
    expect(result.redactedFields).toEqual(
      expect.arrayContaining([
        "provider_transaction_reference",
        "merchant_order_id",
        "purpose",
        "metadata.api_key"
      ])
    );
  });

  it("does not redact payment token symbols", () => {
    const result = redactSnapshot({
      token: "USDC",
      currency: "USDC"
    });

    expect(result.snapshot).toEqual({
      token: "USDC",
      currency: "USDC"
    });
    expect(result.redactedFields).toEqual([]);
  });
});
