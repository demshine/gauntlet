# Mock MCP Paid Tool Example

This example shows where Gauntlet fits in a paid MCP tool flow:

1. The mock tool returns a price quote.
2. The agent creates a payment request for that quote.
3. Gauntlet evaluates the request against local policy and history fixtures.
4. If the request satisfies configured policy, simulated tool access continues.
5. Gauntlet writes a redacted receipt and markdown report.

Run the example from tests with:

```bash
npm test -- tests/examples/mcp-paid-tool.test.ts
```

The example does not move funds, call a real MCP server, verify merchants, or contact a payment provider.

