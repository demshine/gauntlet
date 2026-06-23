import { describe, expect, it } from "vitest";
import { builtInScenarios } from "../../src/scenarios/registry.js";
import { validateScenario, validateScenarios } from "../../src/scenarios/validate.js";

describe("validateScenarios", () => {
  it("accepts all built-in scenarios", () => {
    expect(validateScenarios(builtInScenarios)).toEqual([]);
  });

  it("reports when a scenario expected decision drifts from evaluator output", () => {
    const [scenario] = builtInScenarios;
    const issues = validateScenario({
      ...scenario,
      expected_decision: "policy_failed"
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          scenarioId: scenario.scenario_id,
          code: "expected_decision_mismatch"
        })
      ])
    );
  });

  it("reports when expected reason codes are missing from evaluator output", () => {
    const [scenario] = builtInScenarios;
    const issues = validateScenario({
      ...scenario,
      expected_reason_codes: ["quote_expired"]
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          scenarioId: scenario.scenario_id,
          code: "expected_reason_code_missing"
        })
      ])
    );
  });
});

