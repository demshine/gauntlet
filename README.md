# Gauntlet

A local payment policy test harness for MCP paid tool demos.

Gauntlet helps developers test whether an AI agent's simulated payment request satisfies a configured deterministic policy before a paid MCP tool flow continues. V0.1 is an offline/local devtool. It does not approve payments, move funds, verify merchants, or enforce production runtime policy.

## V0.1 Scope

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

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

