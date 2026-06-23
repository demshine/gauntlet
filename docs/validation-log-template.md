# Validation Log Template

Copy this template for each interview, demo-flow review, or integration trial.

## Contact

- Date:
- Name:
- Company/project:
- Category:
- Relationship: friend / warm intro / cold / public user
- Public repo or demo:

## Flow

- Flow type: MCP paid tool / paid API / wallet infra / agent app / DevRel demo / other
- Realism: real / semi-real / demo-only
- Current provider or payment rail:
- Current testing method:
- Current receipt or logging method:

## Pain

- Payment failures they already test:
- Payment failures they worry about:
- Recent failure or near miss:
- Why current testing is insufficient:

## Scenario Ratings

Rate each `real`, `maybe`, or `not relevant`.

| Scenario | Rating | Notes |
| --- | --- | --- |
| Amount exceeds single payment limit |  |  |
| Cumulative budget exceeded |  |  |
| Blocked or wrong merchant |  |  |
| Wrong token/currency/chain |  |  |
| Quote expired |  |  |
| Amount drift |  |  |
| Duplicate retry/idempotency |  |  |
| Missing required metadata |  |  |

## Trial Metrics

- Tried CLI: yes / no
- Time to built-in run:
- Time to understand policy:
- Time to custom fixture:
- Trial outcome: completed / partial / blocked / not_relevant
- Main blocker:

## Receipt Feedback

- Receipt helped debug: yes / no / unclear
- Missing fields:
- Too-sensitive fields:
- Would store redacted receipt in repo: yes / no / maybe
- CI signal useful: yes / no / maybe

## Commercial Signal

- Will keep using:
- Will provide fixture:
- Will propose scenario:
- Will open issue/PR:
- Will pay for integration support/custom scenarios/policy review:
- Quote:

## Follow-Up

- Next action:
- Owner:
- Due date:
