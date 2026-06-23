# CLI Contract

## `gauntlet init`

Creates local fixture scaffolding.

```bash
gauntlet init
```

Generated structure:

```text
gauntlet/
  policy.yaml
  merchants.json
  quotes.json
  history.json
  requests/
    valid-payment.json
    amount-drift.json
  scenarios/
    amount-drift.yaml
    duplicate-retry.yaml
  receipts/
```

## `gauntlet run`

Runs all built-in must-have scenarios by default.

```bash
gauntlet run
```

Expected outputs:

- terminal summary
- redacted receipts
- markdown report

## `gauntlet run --scenario`

Runs one built-in or local scenario.

```bash
gauntlet run --scenario amount-drift
```

## `gauntlet run --policy --request --history`

Runs one custom request against local fixtures.

```bash
gauntlet run \
  --policy ./gauntlet/policy.yaml \
  --request ./gauntlet/requests/payment_request.json \
  --history ./gauntlet/history.json
```

## CI Behavior

```bash
gauntlet run --ci
gauntlet run --ci --allow-review
```

Exit codes:

- `0`: `policy_passed`
- `1`: `policy_failed`
- `1`: `requires_review` by default
- `0`: `requires_review` with `--allow-review`
- `2`: `invalid_input`
- `3`: CLI, schema, or runtime error

## Redaction

Receipts are redacted by default.

```bash
gauntlet run --unredacted
```

`--unredacted` is local-only and should not be used for public repo artifacts.

