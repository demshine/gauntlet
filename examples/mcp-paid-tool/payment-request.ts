import type { PaymentRequest, Quote } from "../../src/domain/types.js";

export function createMockPaymentRequest(quote: Quote): PaymentRequest {
  return {
    request_id: "req_mcp_tool_001",
    task_id: "task_mcp_tool_demo",
    session_id: "session_mcp_tool_demo",
    idempotency_key: "idem_mcp_tool_001",
    retry_count: 0,
    quote_id: quote.quote_id,
    agent_id: "research-agent",
    merchant: {
      merchant_id: quote.merchant_id,
      canonical_merchant_id: quote.merchant_id,
      merchant_type: "mcp_server",
      merchant_display_name: "Example MCP Paid Tool"
    },
    amount: quote.final_amount,
    currency: quote.quoted_currency,
    token: quote.quoted_currency,
    chain: "base",
    purpose: "Mock MCP paid tool access",
    tool_source: "mcp://example-paid-tool",
    provider: "mock",
    created_at: "2026-06-23T10:05:00Z",
    metadata: {
      idempotency_key: "idem_mcp_tool_001",
      quote_id: quote.quote_id
    }
  };
}

