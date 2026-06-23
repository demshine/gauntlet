import { describe, expect, it } from "vitest";
import { executeRun } from "../../src/cli/run-command.js";

describe("executeRun CI exit codes", () => {
  it("returns exit 0 for passing scenarios in CI mode", async () => {
    const result = await executeRun({
      scenario: "valid-mcp-paid-tool-payment",
      ci: true
    });

    expect(result.exitCode).toBe(0);
  });

  it("returns exit 1 for failing scenarios in CI mode", async () => {
    const result = await executeRun({
      scenario: "quote-expired",
      ci: true
    });

    expect(result.exitCode).toBe(1);
  });
});

