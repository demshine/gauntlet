# Gauntlet

A local payment policy test harness for MCP paid tool demos.

Gauntlet helps developers test whether an AI agent's simulated payment request satisfies a configured deterministic policy before a paid MCP tool flow continues. V0.1 is an offline/local devtool. It does not approve payments, move funds, verify merchants, or enforce production runtime policy.

## V0.1 Scope

Gauntlet is actively seeking external validation; review the [validation goals](./docs/external-validation-plan.md), [contribute a scenario](https://github.com/demshine/gauntlet/issues/new?template=scenario-contribution.yml), or [report integration feedback](https://github.com/demshine/gauntlet/issues/new?template=integration-feedback.yml).

- Local CLI: `gauntlet init`, `gauntlet run`, `gauntlet run --ci`
- Deterministic policy rules for amount, merchant matching, quote expiry, quote drift, idempotency, required metadata, and review thresholds
- `history.json` fixture support for budget and duplicate checks
- Redacted `receipt.json` and developer-facing `report.md`
- One mock MCP paid tool example
- 8 must-have scenarios, with 12 backlog scenarios documented

## Project Docs

- Product PRD: [Gauntlet PRD.md](./Gauntlet%20PRD.md)
- Feature spec: [spec.md](./specs/001-mcp-paid-tool-test-harness/spec.md)
- Implementation plan: [plan.md](./specs/001-mcp-paid-tool-test-harness/plan.md)
- Data model: [data-model.md](./specs/001-mcp-paid-tool-test-harness/data-model.md)
- CLI contract: [contracts/cli.md](./specs/001-mcp-paid-tool-test-harness/contracts/cli.md)
- Quickstart: [quickstart.md](./specs/001-mcp-paid-tool-test-harness/quickstart.md)
- Tasks: [tasks.md](./tasks.md)
- External validation plan: [external-validation-plan.md](./docs/external-validation-plan.md)
- Integration trial: [integration-trial.md](./docs/integration-trial.md)
- Outreach templates: [outreach-templates.md](./docs/outreach-templates.md)
- Validation tracker: [validation-tracker.md](./docs/validation-tracker.md)

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Pull requests run the same verification steps in GitHub Actions.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development and contribution guidelines.

## Current CLI

Run built-in scenarios:

```bash
npm run dev -- run
```

Create local fixtures:

```bash
npm run dev -- init
```

Run a custom local fixture set:

```bash
npm run dev -- run \
  --policy gauntlet/policy.yaml \
  --quote gauntlet/quote.json \
  --request gauntlet/requests/valid-payment.json \
  --history gauntlet/history.json \
  --output-dir gauntlet/receipts
```

Receipts are redacted by default. Use `--unredacted` only for local debugging.

## License

Gauntlet is available under the [MIT License](./LICENSE).
