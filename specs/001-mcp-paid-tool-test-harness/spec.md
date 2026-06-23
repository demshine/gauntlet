# Feature Spec: MCP Paid Tool Payment Test Harness

## Feature Summary

Build Gauntlet V0.1 as an offline/local CLI test harness for MCP paid tool payment demos. The CLI evaluates fixture-based payment requests against deterministic policy rules, uses explicit history fixtures for stateful checks, and emits redacted receipts plus developer-facing reports.

This feature does not move funds, approve payments, enforce runtime production policy, verify merchants, or claim AP2 / x402 compatibility.

## User Stories

### US1: Run Built-In Payment Failure Scenarios (P1)

As an MCP paid tool demo builder, I want to run curated local scenarios so I can see whether my agent payment flow catches common failure cases before I write custom tests.

Independent test criteria:

- `gauntlet init` creates a local fixture directory.
- `gauntlet run` executes the 8 must-have scenarios.
- The summary shows scenario count, decision counts, advisory warning count, and high-signal failures.
- Each scenario produces an expected decision and reason codes.

### US2: Evaluate a Custom Payment Request (P1)

As a developer integrating Gauntlet into a demo repo, I want to pass my own policy, request, quote, merchant, and history fixtures so I can validate my specific payment flow.

Independent test criteria:

- `gauntlet run --policy ./policy.yaml --request ./payment_request.json --history ./history.json` evaluates one custom request.
- Missing required inputs produce `invalid_input`.
- Deterministic violations produce `policy_failed`.
- Review threshold produces `requires_review`.
- Valid requests produce `policy_passed`.

### US3: Generate Redacted Receipts and Markdown Reports (P1)

As a developer debugging a payment flow, I want receipts and markdown reports so I can explain why a request passed, failed, or required review without leaking sensitive fields by default.

Independent test criteria:

- Every run produces a redacted `receipt.json`.
- Every run produces a readable `report.md`.
- Receipt includes policy, merchant, quote, request snapshots, evaluated rules, decision, reason codes, redaction policy, and redacted fields.
- `--unredacted` is explicit and warns that output is local-only.

### US4: Use CI Exit Codes (P2)

As a developer adding Gauntlet to CI, I want stable exit codes so payment policy regressions can block merges.

Independent test criteria:

- `policy_passed` exits 0.
- `requires_review` exits 1 by default and exits 0 with `--allow-review`.
- `policy_failed` exits 1.
- `invalid_input` exits 2.
- CLI, schema, and runtime errors exit 3.

### US5: Understand and Extend Scenario Fixtures (P2)

As a contributor, I want a clear scenario authoring format so I can add high-quality scenarios without changing engine code.

Independent test criteria:

- Each scenario declares `risk_represented`, fixture references, expected decision, expected reason codes, and advisory expectations.
- Scenario validation rejects fixtures without stable expected decisions.
- Backlog scenarios are documented but not counted as V0.1 must-have coverage.

### US6: Run a Mock MCP Paid Tool Flow (P3)

As a demo builder, I want a mock MCP paid tool example so I can understand where Gauntlet fits between quote generation, payment request creation, and tool access.

Independent test criteria:

- Example flow generates a quote.
- Example flow builds a payment request.
- Example flow invokes Gauntlet before simulated tool access.
- Example flow shows receipt output for pass/fail/review paths.

## Functional Requirements

- FR1: The CLI must support `init` and `run` commands.
- FR2: The CLI must load YAML policy fixtures and JSON request/history/merchant/quote fixtures.
- FR3: The engine must evaluate deterministic rules with stable results for identical inputs.
- FR4: The engine must apply decision precedence: `invalid_input`, `policy_failed`, `requires_review`, `policy_passed`.
- FR5: The engine must support stateful checks through explicit `history.json` fixtures only.
- FR6: The engine must not call external provider APIs in V0.1.
- FR7: Receipts must be redacted by default.
- FR8: Reports must explain decision, reason codes, high-signal failures, and advisory warnings.
- FR9: CI mode must implement documented exit-code behavior.
- FR10: The built-in scenario library must include 8 must-have scenarios.

## Non-Goals

- Production runtime enforcement
- Hosted API or team console
- Merchant verification service
- Automatic merchant canonicalization
- Risk scoring
- Real payment orchestration
- Full AP2 / x402 compatibility
- Compliance export

## Success Criteria

- A new developer can run the built-in demo in 5 minutes.
- A developer can understand policy shape in 15 minutes.
- A developer can connect a demo flow in 30 minutes.
- At least 5 of the 8 must-have scenarios are rated useful by external users.
- At least 3 external developers complete an integration.

