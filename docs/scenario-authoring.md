# Scenario Authoring Guide

Gauntlet scenarios are deterministic local fixtures. A scenario is accepted only when the evaluator can run it without network access and produce a stable decision and reason-code set.

## Required Fields

- `scenario_id`: stable kebab-case identifier
- `title`: human-readable label
- `description`: one-sentence summary
- `category`: `must-have` or `backlog`
- `risk_represented`: concrete payment failure or baseline behavior
- `policy`: full policy fixture
- `quote`: quote fixture
- `payment_request`: request fixture
- `history`: explicit state fixture
- `expected_decision`: one of `policy_passed`, `policy_failed`, `requires_review`, `invalid_input`
- `expected_reason_codes`: reason codes expected from failed/review/invalid rules

## Quality Bar

A scenario belongs in the built-in library only when it:

- maps to a real or high-confidence payment failure
- runs locally without external services
- has stable expected decision and reason codes
- explains why a developer might miss it in a hand-written script
- includes history when the rule needs state
- produces useful receipt/report output

## Validation

Use `validateScenario()` or `validateScenarios()` from `src/scenarios/validate.ts` to check that expected decisions and reason codes still match evaluator behavior.

## Current Implementation Note

V0.1 stores built-in scenarios as TypeScript definitions in `src/scenarios/registry.ts`. File-based scenario authoring can be added later once external contributors need it.

