# Contributing

## Before You Start

Gauntlet V0.1 is a local test harness, not a production payment authorization system. It does not approve payments, move funds, or enforce production runtime policy.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Scenario Contributions

Follow the [scenario authoring guide](./docs/scenario-authoring.md), then submit the [scenario contribution form](https://github.com/demshine/gauntlet/issues/new?template=scenario-contribution.yml).

## Sensitive Data

Never commit secrets, payment credentials, personal data, or unredacted production fixtures.

## Pull Requests

Keep changes focused, add tests for behavior changes, and describe the payment failure case the change addresses.
