import { describe, expect, it } from "vitest";
import { DECISION_PRECEDENCE } from "../src/index.js";

describe("decision precedence", () => {
  it("keeps invalid input as the highest priority decision", () => {
    expect(DECISION_PRECEDENCE[0]).toBe("invalid_input");
  });
});

