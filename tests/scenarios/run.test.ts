import { describe, expect, it } from "vitest";
import { builtInScenarios } from "../../src/scenarios/registry.js";
import { runBuiltInScenarios } from "../../src/scenarios/run.js";

describe("built-in scenarios", () => {
  it("registers the 8 must-have V0.1 scenarios", () => {
    expect(builtInScenarios.map((scenario) => scenario.scenario_id)).toEqual([
      "valid-mcp-paid-tool-payment",
      "amount-exceeds-single-payment-limit",
      "cumulative-budget-exceeded",
      "blocked-merchant",
      "wrong-token-or-currency",
      "quote-expired",
      "amount-drift-above-threshold",
      "duplicate-idempotency-key"
    ]);
  });
});

describe("runBuiltInScenarios", () => {
  it("evaluates every built-in scenario and summarizes decisions", () => {
    const result = runBuiltInScenarios();

    expect(result.scenarioCount).toBe(8);
    expect(result.results).toHaveLength(8);
    expect(result.decisionCounts.policy_passed).toBe(1);
    expect(result.decisionCounts.policy_failed).toBe(7);
    expect(result.decisionCounts.requires_review).toBe(0);
    expect(result.decisionCounts.invalid_input).toBe(0);
    expect(result.highSignalFailures.length).toBeGreaterThan(0);
  });
});

