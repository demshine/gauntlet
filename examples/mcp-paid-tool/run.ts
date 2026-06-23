import { join } from "node:path";
import { evaluatePaymentRequest } from "../../src/engine/evaluate.js";
import { writeRunArtifacts } from "../../src/io/output.js";
import { buildMarkdownReport } from "../../src/report/markdown.js";
import { buildReceipt } from "../../src/report/receipt.js";
import type { Decision } from "../../src/index.js";
import type { History, Policy } from "../../src/domain/types.js";
import { createMockPaymentRequest } from "./payment-request.js";
import { createMockQuote } from "./quote.js";

export interface MockMcpPaidToolExampleOptions {
  outputDir?: string;
}

export interface MockMcpPaidToolExampleResult {
  decision: Decision;
  toolAccessGranted: boolean;
  receiptPath: string;
  reportPath: string;
}

const policy: Policy = {
  policy_id: "mcp-paid-tool-demo-policy",
  version: 1,
  agent_id: "research-agent",
  max_amount_per_payment: 5,
  max_total_budget: 20,
  budget_window: "task",
  currency: "USDC",
  chain: "base",
  allowed_merchants: ["merchant_api_example"],
  blocked_merchants: [],
  requires_review_above: 5,
  expires_at: "2026-06-30T23:59:59Z",
  max_payments_per_task: 2,
  max_quote_drift_percentage: 10,
  required_metadata: ["idempotency_key", "quote_id"]
};

const history: History = {
  task_id: "task_mcp_tool_demo",
  session_id: "session_mcp_tool_demo",
  prior_requests: [],
  prior_decisions: [],
  prior_receipts: [],
  total_amount_spent: 0,
  payment_count_for_task: 0,
  used_idempotency_keys: []
};

export async function runMockMcpPaidToolExample(
  options: MockMcpPaidToolExampleOptions = {}
): Promise<MockMcpPaidToolExampleResult> {
  const quote = createMockQuote();
  const request = createMockPaymentRequest(quote);
  const evaluation = evaluatePaymentRequest({ policy, quote, request, history });
  const receipt = buildReceipt({
    simulatorVersion: "0.1.0",
    evaluation,
    scenarioId: "mock-mcp-paid-tool",
    snapshots: {
      policy,
      merchant: request.merchant,
      quote,
      payment_request: request
    }
  });
  const decisionCounts = {
    policy_passed: evaluation.decision === "policy_passed" ? 1 : 0,
    policy_failed: evaluation.decision === "policy_failed" ? 1 : 0,
    requires_review: evaluation.decision === "requires_review" ? 1 : 0,
    invalid_input: evaluation.decision === "invalid_input" ? 1 : 0
  };
  const report = buildMarkdownReport({
    title: "Gauntlet run complete",
    scenarioCount: 1,
    decisionCounts,
    advisoryWarningCount: evaluation.advisory_warnings.length,
    highSignalFailures:
      evaluation.decision === "policy_passed"
        ? []
        : [{ scenarioId: "mock-mcp-paid-tool", message: evaluation.reason_codes.join(", ") }]
  });
  const artifacts = await writeRunArtifacts({
    outputDir: options.outputDir ?? join(process.cwd(), "gauntlet", "receipts"),
    receipt,
    reportMarkdown: report
  });

  return {
    decision: evaluation.decision,
    toolAccessGranted: evaluation.decision === "policy_passed",
    receiptPath: artifacts.receiptPath,
    reportPath: artifacts.reportPath
  };
}
