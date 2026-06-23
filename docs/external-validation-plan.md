# External Validation Plan

Use this plan after V0.1 local verification passes. The goal is to decide whether Gauntlet should continue toward a preflight API, remain a scenario library/devtool, or pause.

## Validation Thesis

Gauntlet is worth continuing only if real agent-payment builders have payment flows that are painful to test with generic scripts, and if the V0.1 CLI helps them find, explain, or prevent realistic failures faster than their current approach.

## Target Mix

Interview 20 people across:

- 8 MCP paid tool or agent tool-use payment demo builders
- 4 paid API or x402-like demo builders
- 3 agent wallet or payment infrastructure builders
- 3 agent application builders
- 2 DevRel or hackathon demo builders

Collect 5 real or semi-real demo flows:

- At least 3 from MCP paid tool or agent tool-use payment demos
- At least 2 where the developer is willing to try the CLI
- At least 1 that can publicly mention Gauntlet in a repo, demo, or writeup
- At least 1 team willing to discuss paid custom scenario or integration support

## Weekly Cadence

### Week 1: Interview Pipeline

- Identify 30 candidate contacts.
- Complete 8 interviews.
- Ask every qualified user for one demo flow or fixture-shaped example.
- Track current testing method, pain level, missing failure cases, and willingness to try CLI.

### Week 2: Trial Runs

- Complete 12 more interviews.
- Run 3 assisted CLI trials with target users.
- Capture setup time, first confusion point, and whether receipts help debug.
- Identify at least 5 scenario gaps or confirm that the 8 must-have scenarios are sufficient.

### Week 3: Integration Attempts

- Support 2-3 external developers integrating Gauntlet into a demo repo.
- Track whether they complete built-in run in 5 minutes, understand policy in 15 minutes, and connect one demo flow in 30 minutes.
- Ask whether they would keep Gauntlet in the repo after the call.

### Week 4: Decision Review

- Score evidence against continuation gates.
- Decide one of:
  - Continue to V0.2 preflight API.
  - Stay focused on open-source scenario library and docs.
  - Pause or pivot if problem intensity is weak.

## Evidence To Capture

- Current payment testing workflow.
- Failure cases already handled.
- Failure cases they worry about but do not test.
- Whether duplicate retry, amount drift, merchant mismatch, quote expiry, and missing idempotency key feel real.
- Time to first successful built-in run.
- Time to first custom fixture run.
- Whether receipt/report output is better than current logs.
- Whether CI behavior is clear or noisy.
- Whether the user contributes a scenario, issue, PR, or fixture.
- Whether a team is willing to pay for integration help, custom scenario pack, or payment policy review.

## Continue Gates

The next stage requires the first two gates and a majority of the rest:

- At least 3 external developers complete an integration.
- At least 1 non-friend user proposes a scenario.
- At least 1 team is willing to pay for integration support, custom scenarios, or policy review.
- The GitHub repo receives a real issue or PR.
- At least 5 of 8 must-have scenarios are rated useful.
- At least 1 real flow uncovers a problem the user had not noticed.
- Users say Gauntlet is meaningfully better than their first self-written script.

## Stop Or Pivot Signals

- Fewer than 5 of 20 interviewees have real or semi-real agent-payment flows.
- MCP paid tool builders care less than paid API or wallet infra builders.
- External developers regularly need more than 60 minutes to run a demo flow.
- Users only want to copy example code and do not want to keep the CLI.
- Receipt output is not meaningfully better than ordinary logs.
- CI failure is perceived as noise.
- No user is willing to provide a scenario or history fixture.
