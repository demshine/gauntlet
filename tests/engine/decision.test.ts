import { describe, expect, it } from "vitest";
import { chooseDecision, getCiExitCode } from "../../src/engine/decision.js";

describe("chooseDecision", () => {
  it("uses invalid_input before all other decisions", () => {
    expect(chooseDecision(["policy_passed", "policy_failed", "invalid_input"])).toBe(
      "invalid_input"
    );
  });

  it("uses policy_failed before requires_review", () => {
    expect(chooseDecision(["policy_passed", "requires_review", "policy_failed"])).toBe(
      "policy_failed"
    );
  });
});

describe("getCiExitCode", () => {
  it("treats requires_review as failure by default", () => {
    expect(getCiExitCode("requires_review", { allowReview: false })).toBe(1);
  });

  it("allows requires_review when explicitly configured", () => {
    expect(getCiExitCode("requires_review", { allowReview: true })).toBe(0);
  });
});

