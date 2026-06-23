# Validation Checklist

Use this checklist before declaring V0.1 ready for external validation.

## Local Product Checks

- [ ] `gauntlet init` creates the documented fixture directory.
- [ ] `gauntlet run` runs exactly 8 must-have scenarios.
- [ ] `gauntlet run --scenario amount-drift` runs one scenario.
- [ ] `gauntlet run --policy --request --history` evaluates a custom request.
- [ ] Deterministic decision precedence matches the PRD.
- [ ] Receipts are redacted by default.
- [ ] Markdown reports explain high-signal failures.
- [ ] CI exit codes match the CLI contract.

## Scope Checks

- [ ] No production payment calls.
- [ ] No hosted API.
- [ ] No merchant verification.
- [ ] No automatic merchant canonicalization.
- [ ] No risk score.
- [ ] No full AP2 / x402 compatibility claim.

## External Validation Checks

- [ ] 20 target-user interviews completed.
- [ ] 5 real or semi-real demo flows collected.
- [ ] 3 external developers completed an integration.
- [ ] 1 non-friend user proposed a scenario.
- [ ] 1 team showed willingness to pay for integration support or custom scenarios.
- [ ] At least 5 of 8 must-have scenarios were rated useful.

