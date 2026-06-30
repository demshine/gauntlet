# Tasks: MCP Paid Tool Payment Test Harness

Input docs:

- [PRD](./Gauntlet%20PRD.md)
- [Feature Spec](./specs/001-mcp-paid-tool-test-harness/spec.md)
- [Implementation Plan](./specs/001-mcp-paid-tool-test-harness/plan.md)
- [Data Model](./specs/001-mcp-paid-tool-test-harness/data-model.md)
- [CLI Contract](./specs/001-mcp-paid-tool-test-harness/contracts/cli.md)
- [Scenario Library](./specs/001-mcp-paid-tool-test-harness/scenarios.md)

## Phase 1: Setup

- [X] T001 Install npm dependencies from `/Users/echo/claudesidian/01_Projects/Gauntlet/package.json`
- [X] T002 Verify TypeScript config in `/Users/echo/claudesidian/01_Projects/Gauntlet/tsconfig.json`
- [X] T003 Verify Vitest config in `/Users/echo/claudesidian/01_Projects/Gauntlet/vitest.config.ts`
- [X] T004 [P] Add reason-code constants in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/domain/reason-codes.ts`
- [X] T005 [P] Add shared result types in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/domain/results.ts`

## Phase 2: Foundational

- [X] T006 Create Zod schemas for Policy, Merchant, Quote, PaymentRequest, History, Scenario, and Receipt in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/domain/schemas.ts`
- [X] T007 Create fixture loading utilities for YAML and JSON in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/io/fixtures.ts`
- [X] T008 Create filesystem output utilities for receipts and reports in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/io/output.ts`
- [X] T009 Implement decision precedence helper in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/decision.ts`
- [X] T010 Implement redaction policy in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/report/redaction.ts`
- [X] T011 [P] Add unit tests for schema validation in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/domain/schemas.test.ts`
- [X] T012 [P] Add unit tests for decision precedence in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/engine/decision.test.ts`
- [X] T013 [P] Add unit tests for redaction in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/report/redaction.test.ts`

## Phase 3: User Story 1 - Run Built-In Payment Failure Scenarios (P1)

Goal: A developer can run the 8 must-have scenarios locally and get stable decisions.

Independent test criteria: `gauntlet run` executes 8 scenarios and prints a summary with decision counts and high-signal failures.

- [X] T014 [US1] Create built-in scenario definitions in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T015 [P] [US1] Add valid payment scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T016 [P] [US1] Add amount limit scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T017 [P] [US1] Add cumulative budget scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T018 [P] [US1] Add blocked merchant scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T019 [P] [US1] Add wrong currency scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T020 [P] [US1] Add quote expired scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T021 [P] [US1] Add amount drift scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T022 [P] [US1] Add duplicate idempotency scenario definition in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T023 [US1] Create built-in scenario registry in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/registry.ts`
- [X] T024 [US1] Implement scenario runner in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/run.ts`
- [X] T025 [US1] Add scenario runner tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/scenarios/run.test.ts`
- [X] T025A [US1] Wire `gauntlet run` built-in scenario summary in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli.ts`
- [X] T025B [US1] Wire `gauntlet run --scenario` scenario selection in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli/run-command.ts`

## Phase 4: User Story 2 - Evaluate a Custom Payment Request (P1)

Goal: A developer can evaluate local policy/request/history fixtures.

Independent test criteria: `gauntlet run --policy --request --history` returns the expected decision and reason codes for custom fixtures.

- [X] T026 [US2] Implement required field and metadata rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/required-fields.ts`
- [X] T027 [P] [US2] Implement max amount rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/max-amount.ts`
- [X] T028 [P] [US2] Implement cumulative budget rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/cumulative-budget.ts`
- [X] T029 [P] [US2] Implement merchant allow/block rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/merchant-match.ts`
- [X] T030 [P] [US2] Implement currency/token rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/currency-token.ts`
- [X] T031 [P] [US2] Implement chain/network rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/chain-network.ts`
- [X] T032 [P] [US2] Implement policy expiry rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/policy-expiry.ts`
- [X] T033 [P] [US2] Implement quote expiry rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/quote-expiry.ts`
- [X] T034 [P] [US2] Implement quote drift rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/quote-drift.ts`
- [X] T035 [P] [US2] Implement idempotency rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/idempotency.ts`
- [X] T036 [P] [US2] Implement review threshold rule in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/rules/review-threshold.ts`
- [X] T037 [US2] Implement evaluation orchestrator in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/evaluate.ts`
- [X] T038 [US2] Add rule unit tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/engine/rules.test.ts`
- [X] T039 [US2] Add custom request integration tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/engine/evaluate.test.ts`
- [X] T039A [US2] Wire `gauntlet run --policy --quote --request --history` in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli/run-command.ts`

## Phase 5: User Story 3 - Generate Redacted Receipts and Markdown Reports (P1)

Goal: Every run creates debug artifacts that are useful and safe by default.

Independent test criteria: receipt and report files include decision, reason codes, evaluated rules, and redaction metadata.

- [X] T040 [US3] Implement receipt builder in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/report/receipt.ts`
- [X] T041 [US3] Implement markdown report builder in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/report/markdown.ts`
- [X] T042 [US3] Add receipt writer integration in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/io/output.ts`
- [X] T043 [US3] Add report snapshot tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/report/markdown.test.ts`
- [X] T044 [US3] Add receipt redaction tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/report/receipt.test.ts`
- [X] T044A [US3] Wire `--unredacted` receipt generation in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli/run-command.ts`

## Phase 6: User Story 4 - Use CI Exit Codes (P2)

Goal: CI mode provides stable process exit behavior.

Independent test criteria: each decision maps to the documented exit code, including `--allow-review`.

- [X] T045 [US4] Implement CI exit-code mapper in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/engine/decision.ts`
- [X] T046 [US4] Wire `--ci` and `--allow-review` into `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli.ts`
- [X] T047 [US4] Add CLI exit-code tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/cli/exit-codes.test.ts`

## Phase 7: User Story 5 - Understand and Extend Scenario Fixtures (P2)

Goal: Contributors can add scenarios without changing engine logic.

Independent test criteria: scenario fixtures validate authoring metadata and expected outcomes.

- [X] T048 [US5] Create scenario authoring guide in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/scenario-authoring.md`
- [X] T049 [US5] Implement scenario fixture validation in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/scenarios/validate.ts`
- [X] T050 [US5] Document backlog scenarios in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/backlog-scenarios.md`
- [X] T051 [US5] Add scenario validation tests in `/Users/echo/claudesidian/01_Projects/Gauntlet/tests/scenarios/validate.test.ts`

## Phase 8: User Story 6 - Run a Mock MCP Paid Tool Flow (P3)

Goal: The example demonstrates where Gauntlet fits in a paid MCP tool flow.

Independent test criteria: example quote, payment request, Gauntlet decision, and receipt are visible from one command.

- [X] T052 [US6] Create example directory in `/Users/echo/claudesidian/01_Projects/Gauntlet/examples/mcp-paid-tool`
- [X] T053 [US6] Implement mock quote generation in `/Users/echo/claudesidian/01_Projects/Gauntlet/examples/mcp-paid-tool/quote.ts`
- [X] T054 [US6] Implement mock payment request generation in `/Users/echo/claudesidian/01_Projects/Gauntlet/examples/mcp-paid-tool/payment-request.ts`
- [X] T055 [US6] Implement example runner in `/Users/echo/claudesidian/01_Projects/Gauntlet/examples/mcp-paid-tool/run.ts`
- [X] T056 [US6] Document example flow in `/Users/echo/claudesidian/01_Projects/Gauntlet/examples/mcp-paid-tool/README.md`

## Final Phase: Polish and Cross-Cutting

- [X] T057 Update root README with implemented commands in `/Users/echo/claudesidian/01_Projects/Gauntlet/README.md`
- [X] T058 Add generated fixture examples through `gauntlet init` in `/Users/echo/claudesidian/01_Projects/Gauntlet/src/cli/init-command.ts`
- [X] T059 Add release checklist in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/release-checklist.md`
- [X] T060 Run typecheck, tests, and build from `/Users/echo/claudesidian/01_Projects/Gauntlet`

## Phase 9: External Validation

Goal: Decide whether V0.1 has enough real user signal to justify V0.2.

- [X] T061 Add external validation plan in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/external-validation-plan.md`
- [X] T062 Add interview guide in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/interview-guide.md`
- [X] T063 Add integration trial script in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/integration-trial.md`
- [X] T064 Add validation log template in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/validation-log-template.md`
- [X] T065 Add outreach templates in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/outreach-templates.md`
- [X] T066 Add validation tracker in `/Users/echo/claudesidian/01_Projects/Gauntlet/docs/validation-tracker.md`
- [X] T067 Add GitHub issue templates for external scenario and integration feedback in `/Users/echo/claudesidian/01_Projects/Gauntlet/.github/ISSUE_TEMPLATE`
- [X] T067A Add GitHub Actions CI for pull request verification in `/Users/echo/claudesidian/01_Projects/Gauntlet/.github/workflows/ci.yml`
- [X] T067B Complete public-readiness audit and publish the repository.
- [X] T067C Qualify 30 external validation candidates.
- [ ] T067D Send 10 personalized first-wave invitations.
- [ ] T068 Complete 20 target-user interviews.
- [ ] T069 Collect 5 real or semi-real demo flows.
- [ ] T070 Support 3 external developer integrations.
- [ ] T071 Review continue/pivot gates before starting V0.2.

## Dependencies

- Phase 1 must complete first.
- Phase 2 blocks all user stories.
- US1, US2, and US3 are the MVP path.
- US4 depends on US2 decision outputs.
- US5 depends on US1 fixture structure.
- US6 depends on US2 and US3.

## Parallel Opportunities

- T004 and T005 can run in parallel.
- T011, T012, and T013 can run in parallel after foundational files exist.
- T015-T022 can run in parallel because each scenario has separate fixture files.
- T027-T036 can run in parallel because rule implementations are separate files after shared rule interfaces exist.

## MVP Scope

MVP is complete when Phase 1, Phase 2, US1, US2, and US3 pass:

- built-in scenarios run
- custom fixture evaluation works
- redacted receipts and markdown reports are generated
