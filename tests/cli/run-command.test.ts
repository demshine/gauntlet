import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { stringify } from "yaml";
import { describe, expect, it } from "vitest";
import { executeRun } from "../../src/cli/run-command.js";
import type { History, PaymentRequest, Policy, Quote } from "../../src/domain/types.js";

const policy: Policy = {
  policy_id: "default-agent-payment-policy",
  version: 1,
  agent_id: "research-agent",
  max_amount_per_payment: 5,
  max_total_budget: 20,
  budget_window: "task",
  currency: "USDC",
  chain: "base",
  allowed_merchants: ["merchant_api_example"],
  blocked_merchants: ["merchant_blocked"],
  requires_review_above: 5,
  expires_at: "2026-06-30T23:59:59Z",
  max_payments_per_task: 2,
  max_quote_drift_percentage: 10,
  required_metadata: ["idempotency_key", "quote_id"]
};

const quote: Quote = {
  quote_id: "quote_123",
  merchant_id: "merchant_api_example",
  quoted_amount: 2,
  quoted_currency: "USDC",
  quoted_at: "2026-06-23T10:00:00Z",
  expires_at: "2026-06-23T10:10:00Z",
  item_description: "MCP paid tool access",
  final_amount: 2,
  drift_amount: 0,
  drift_percentage: 0
};

const request: PaymentRequest = {
  request_id: "req_123",
  task_id: "task_123",
  session_id: "session_123",
  idempotency_key: "idem_123",
  retry_count: 0,
  quote_id: "quote_123",
  agent_id: "research-agent",
  merchant: {
    merchant_id: "merchant_api_example",
    canonical_merchant_id: "merchant_api_example",
    merchant_type: "mcp_server"
  },
  amount: 2,
  currency: "USDC",
  token: "USDC",
  chain: "base",
  created_at: "2026-06-23T10:05:00Z",
  metadata: {
    idempotency_key: "idem_123",
    quote_id: "quote_123"
  }
};

const history: History = {
  task_id: "task_123",
  session_id: "session_123",
  prior_requests: [],
  prior_decisions: [],
  prior_receipts: [],
  total_amount_spent: 0,
  payment_count_for_task: 0,
  used_idempotency_keys: []
};

describe("executeRun", () => {
  it("evaluates a custom request from local fixtures and writes artifacts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-run-"));
    try {
      const policyPath = join(dir, "policy.yaml");
      const quotePath = join(dir, "quote.json");
      const requestPath = join(dir, "request.json");
      const historyPath = join(dir, "history.json");
      const outputDir = join(dir, "receipts");

      await writeFile(policyPath, stringify(policy), "utf8");
      await writeFile(quotePath, JSON.stringify(quote), "utf8");
      await writeFile(requestPath, JSON.stringify(request), "utf8");
      await writeFile(historyPath, JSON.stringify(history), "utf8");

      const result = await executeRun({
        policy: policyPath,
        quote: quotePath,
        request: requestPath,
        history: historyPath,
        outputDir
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Policy passed: 1");
      expect(result.artifacts?.receiptPath).toBeDefined();
      await expect(readFile(result.artifacts!.receiptPath, "utf8")).resolves.toContain(
        "policy_passed"
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("writes unredacted receipts only when explicitly requested", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-run-"));
    try {
      const policyPath = join(dir, "policy.yaml");
      const quotePath = join(dir, "quote.json");
      const requestPath = join(dir, "request.json");

      await writeFile(policyPath, stringify(policy), "utf8");
      await writeFile(quotePath, JSON.stringify(quote), "utf8");
      await writeFile(
        requestPath,
        JSON.stringify({
          ...request,
          provider_transaction_reference: "txn_secret"
        }),
        "utf8"
      );

      const result = await executeRun({
        policy: policyPath,
        quote: quotePath,
        request: requestPath,
        outputDir: join(dir, "receipts"),
        unredacted: true
      });

      const receipt = await readFile(result.artifacts!.receiptPath, "utf8");
      expect(receipt).toContain("txn_secret");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
