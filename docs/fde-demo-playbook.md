# FDE Demo Playbook

Use this when presenting Gauntlet as a field demo. The goal is not to pitch a finished payment platform. The goal is to make agent-payment risk concrete in 5 minutes.

## Demo URL

Open the static browser demo:

```bash
open demo/index.html
```

No dev server is required.

## 5 Minute Flow

1. Start on `Valid MCP paid tool payment`.
   - Say: "This is a local preflight check before an agent continues a paid tool flow."
   - Show the policy limit, quote, request, and redacted receipt.

2. Switch to `Amount drift above threshold`.
   - Say: "The danger is not only that the first amount is too high. It is that a quote can change between challenge and payment."
   - Run preflight.
   - Point to `quote_amount_drift_exceeded`.

3. Switch to `Duplicate idempotency key`.
   - Say: "Retries are where agent payment demos often get weird. A retry needs to be safe, not just successful."
   - Run preflight.
   - Point to `duplicate_idempotency_key`.

4. Change the merchant dropdown to `Blocked merchant`.
   - Say: "This is the simplest policy boundary: same task, same agent, different merchant, different decision."

5. Close on the receipt.
   - Say: "The artifact matters. A receipt gives developers a debug trail they can attach to CI, a PR, or an incident review."

## CLI Backup

If the browser is not available, use the CLI:

```bash
npm install
npm run build
npm run dev -- run
npm run dev -- run --scenario amount-drift
```

For custom fixtures:

```bash
npm run dev -- init
npm run dev -- run \
  --policy gauntlet/policy.yaml \
  --quote gauntlet/quote.json \
  --request gauntlet/requests/valid-payment.json \
  --history gauntlet/history.json \
  --output-dir gauntlet/receipts
```

## What This Demonstrates

- Deterministic payment policy checks before a paid tool flow continues.
- Failure scenarios that ordinary agent demos often skip.
- Redacted receipts for debugging and CI.
- A repeatable way to turn a real customer flow into a safe local fixture.

## What Not To Claim

- Do not claim Gauntlet approves real payments.
- Do not claim it verifies merchant identity.
- Do not claim it is production runtime enforcement.
- Do not claim V0.2 is validated.

## Strong FDE Angle

The useful field motion is:

> Give me one payment flow from your agent demo, and I will turn the risky edge cases into local fixtures you can run before real money moves.

That offer is more concrete than "agent payment safety", and it maps directly to custom scenario work, integration support, and policy review.
