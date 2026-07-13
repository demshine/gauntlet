# Validation Tracker

Use this tracker to summarize interviews, demo flows, external integrations, and next-stage gates. Keep raw notes in separate copies of `validation-log-template.md`; this file is the rollup.

## Targets

| Metric | Target | Current | Status |
| --- | ---: | ---: | --- |
| Target-user interviews | 20 | 0 | Not started |
| Real or semi-real demo flows | 5 | 0 | Not started |
| External developer integrations | 3 | 0 | Not started |
| Non-friend scenario proposals | 1 | 0 | Not started |
| Teams willing to pay for support/custom scenarios | 1 | 0 | Not started |
| Must-have scenarios rated useful | 5 of 8 | 1 of 8 | Early signal |

## Interview Pipeline

| ID | Date | Contact | Category | Relationship | Flow realism | Current testing | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| V-001 |  |  |  |  |  |  |  |

## Demo Flow Candidates

| ID | Source | Flow type | Public link | Realism | CLI trial | Fixture received | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 |  |  |  |  |  |  |  |

## Integration Trials

| ID | Developer | Repo/demo | Built-in run time | Policy understanding time | Custom fixture time | Outcome | Blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| I-001 |  |  |  |  |  |  |  |

## Scenario Usefulness Rollup

Rate each scenario after every interview or trial as `real`, `maybe`, or `not relevant`.

| Scenario | Real | Maybe | Not relevant | Notes |
| --- | ---: | ---: | ---: | --- |
| Amount exceeds single payment limit | 0 | 0 | 0 |  |
| Cumulative budget exceeded | 0 | 0 | 0 |  |
| Blocked or wrong merchant | 0 | 0 | 0 |  |
| Wrong token/currency/chain | 0 | 0 | 0 |  |
| Quote expired | 0 | 0 | 0 |  |
| Amount drift | 1 | 0 | 0 | MCP Dev LATAM maintainer ranked the drift assertion highest priority for mocked x402/OAC tests. |
| Duplicate retry/idempotency | 0 | 0 | 0 |  |
| Missing required metadata | 0 | 0 | 0 |  |

## Public Outreach Replies

| Date | Source | Signal | Next action |
| --- | --- | --- | --- |
| 2026-07-08 | [MCP Dev LATAM issue #212](https://github.com/codespar/mcp-dev-latam/issues/212#issuecomment-4919237747) | Maintainer said the proposed matrix is useful, all five assertions are in scope, and amount drift is the highest-priority assertion. | Follow-up posted on 2026-07-13 asking whether a redacted OAC/x402 drift fixture boundary maps to their mocked-fetch tests. |

## Continue Gate Review

Review before starting V0.2.

| Gate | Required | Current evidence | Pass? |
| --- | --- | --- | --- |
| 3 external developers completed an integration | Yes |  | No |
| 1 non-friend user proposed a scenario | Yes |  | No |
| 1 team willing to pay for support/custom scenarios | Majority gate |  | No |
| Real GitHub issue or PR | Majority gate |  | No |
| 5 of 8 must-have scenarios rated useful | Majority gate | 1 of 8 has public positive signal: amount drift. | No |
| 1 real flow found an unnoticed problem | Majority gate |  | No |
| Users say Gauntlet beats first self-written script | Majority gate |  | No |

## Decision Log

| Date | Decision | Evidence | Next action |
| --- | --- | --- | --- |
| 2026-07-13 | Keep validation in outreach mode; do not start V0.2 yet. | 1 public maintainer reply supports the amount-drift scenario, but interviews, demo flows, and external integrations are still at 0. | Wait for fixture-boundary confirmation from the respondent; send one follow-up to the remaining first-wave contacts only where it adds project-specific value. |
