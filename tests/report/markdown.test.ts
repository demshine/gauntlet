import { describe, expect, it } from "vitest";
import { buildMarkdownReport } from "../../src/report/markdown.js";

describe("buildMarkdownReport", () => {
  it("summarizes decision, reason codes, and high-signal failures", () => {
    const markdown = buildMarkdownReport({
      title: "Gauntlet run complete",
      scenarioCount: 1,
      decisionCounts: {
        policy_passed: 0,
        policy_failed: 1,
        requires_review: 0,
        invalid_input: 0
      },
      advisoryWarningCount: 0,
      highSignalFailures: [
        {
          scenarioId: "quote-expired",
          message: "quote expired before payment request was created"
        }
      ]
    });

    expect(markdown).toContain("# Gauntlet run complete");
    expect(markdown).toContain("Scenarios: 1");
    expect(markdown).toContain("Policy failed: 1");
    expect(markdown).toContain("quote-expired");
  });
});

