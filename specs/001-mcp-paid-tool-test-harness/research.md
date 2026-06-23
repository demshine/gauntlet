# Research Decisions

## Decision: TypeScript + Node.js CLI

Rationale: Gauntlet is a developer-facing CLI with JSON/YAML fixtures, good npm distribution options, and future adjacency to MCP tooling. TypeScript gives strong schema and domain typing without slowing down early iteration.

Alternatives considered:

- Python CLI: strong scripting ergonomics, but less aligned with MCP/agent tooling distribution.
- Go CLI: excellent binary distribution, but slower early iteration for schema-heavy modeling.

## Decision: Commander for CLI

Rationale: Commander is stable, small, and sufficient for `init`, `run`, flags, and CI behavior.

Alternatives considered:

- oclif: more structure than V0.1 needs.
- yargs: also viable, but Commander is simpler for this scope.

## Decision: Zod for Fixture Validation

Rationale: Zod keeps runtime validation and TypeScript types close together, which is useful for local fixtures and precise `invalid_input` results.

Alternatives considered:

- JSON Schema + Ajv: strong for public schema export, but heavier for initial iteration.
- Manual validation: too easy to drift from data model.

## Decision: Local Filesystem Only

Rationale: V0.1 must stay offline and deterministic. Local fixtures are enough for policy, quote, request, history, receipt, and report artifacts.

Alternatives considered:

- SQLite: useful later for replay/history, unnecessary for fixture-based V0.1.
- Hosted API: explicitly out of scope.

## Decision: Redacted Receipt by Default

Rationale: Receipts may contain provider references, wallet addresses, merchant order IDs, and free-form purpose text. Redaction must be default behavior to keep public demo repos safe.

Alternatives considered:

- Unredacted by default: easier debugging, but unsafe for public artifacts.
- No snapshots in receipts: safer, but undermines replay/debug value.

