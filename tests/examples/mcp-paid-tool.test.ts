import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createMockQuote } from "../../examples/mcp-paid-tool/quote.js";
import { createMockPaymentRequest } from "../../examples/mcp-paid-tool/payment-request.js";
import { runMockMcpPaidToolExample } from "../../examples/mcp-paid-tool/run.js";

describe("mock MCP paid tool example", () => {
  it("creates a quote and payment request for the same merchant", () => {
    const quote = createMockQuote();
    const request = createMockPaymentRequest(quote);

    expect(request.quote_id).toBe(quote.quote_id);
    expect(request.merchant.merchant_id).toBe(quote.merchant_id);
  });

  it("runs the mock paid tool flow and writes artifacts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-mcp-example-"));
    try {
      const result = await runMockMcpPaidToolExample({ outputDir: dir });

      expect(result.decision).toBe("policy_passed");
      expect(result.toolAccessGranted).toBe(true);
      await expect(readFile(result.receiptPath, "utf8")).resolves.toContain("policy_passed");
      await expect(readFile(result.reportPath, "utf8")).resolves.toContain(
        "Gauntlet run complete"
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

