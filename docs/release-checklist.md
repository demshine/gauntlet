# Release Checklist

Use this before tagging any V0.1 release.

## Local Verification

- [ ] `npm install`
- [ ] `npm test`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm audit --omit=optional`

## CLI Smoke

- [ ] `gauntlet init` creates `gauntlet/`
- [ ] `gauntlet run` executes 8 built-in scenarios
- [ ] `gauntlet run --scenario quote-expired --ci` exits 1
- [ ] custom fixture run writes `receipt.json`
- [ ] custom fixture run writes `report.md`
- [ ] default receipt redacts sensitive fields
- [ ] `--unredacted` writes full local receipt

## Scope Guard

- [ ] No real payment calls
- [ ] No hosted API
- [ ] No merchant verification
- [ ] No risk score
- [ ] No full AP2 / x402 compatibility claim

