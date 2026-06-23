import type { Quote } from "../../src/domain/types.js";

export function createMockQuote(): Quote {
  return {
    quote_id: "quote_mcp_tool_001",
    merchant_id: "merchant_api_example",
    quoted_amount: 2,
    quoted_currency: "USDC",
    quoted_at: "2026-06-23T10:00:00Z",
    expires_at: "2026-06-23T10:10:00Z",
    item_description: "Mock MCP paid tool access",
    final_amount: 2,
    drift_amount: 0,
    drift_percentage: 0
  };
}

