# Quickstart

## Install

```bash
npm install
npm run build
```

## Create Local Fixtures

```bash
npm run dev -- init
```

This will create a local `gauntlet/` fixture directory once `init` is implemented.

## Run Built-In Scenarios

```bash
npm run dev -- run
```

Expected summary:

```text
Gauntlet run complete

Scenarios: 8
Policy passed: 1
Policy failed: 7
Requires review: 0
Invalid input: 0
Advisory warnings: 0
```

## Run One Scenario

```bash
npm run dev -- run --scenario amount-drift
```

## Run a Custom Request

```bash
npm run dev -- run \
  --policy ./gauntlet/policy.yaml \
  --quote ./gauntlet/quote.json \
  --request ./gauntlet/requests/valid-payment.json \
  --history ./gauntlet/history.json
```

## CI

```bash
npm run dev -- run --ci
```
