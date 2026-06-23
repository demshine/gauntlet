# Integration Trial

Use this with external developers. The trial is successful only if the developer can run the core flow with their own repo or a realistic fixture, not just watch a demo.

## Trial Goals

- Built-in scenarios run within 5 minutes.
- Policy shape is understandable within 15 minutes.
- One custom fixture run works within 30 minutes.
- The user can explain at least one receipt or report without help.

## Setup

```bash
npm install
npm run build
npm run dev -- init
```

Record:

- Time to install dependencies.
- Time to create fixtures.
- Any environment issue.
- Any command or docs confusion.

## Built-In Scenario Run

```bash
npm run dev -- run
```

Expected summary:

```text
Scenarios: 8
Policy passed: 1
Policy failed: 7
Requires review: 0
Invalid input: 0
```

Ask:

- Which failure is most relevant to your flow?
- Which failure feels unrealistic?
- Which missing failure would you add first?

## Single Scenario Run

```bash
npm run dev -- run --scenario amount-drift
```

Ask the developer to find the reason code and explain why the policy failed.

## Custom Fixture Run

```bash
npm run dev -- run \
  --policy ./gauntlet/policy.yaml \
  --quote ./gauntlet/quote.json \
  --request ./gauntlet/requests/valid-payment.json \
  --history ./gauntlet/history.json \
  --output-dir ./gauntlet/receipts
```

Ask the developer to modify one field and predict the new decision before running again.

Good modifications:

- Increase `amount` above `max_amount_per_payment`.
- Change `currency` from `USDC` to another token.
- Add the request idempotency key to `history.used_idempotency_keys`.
- Move `quote.expires_at` before `payment_request.created_at`.

## Receipt Review

Open:

- `gauntlet/receipts/receipt.json`
- `gauntlet/receipts/report.md`

Ask:

- Can you tell why the request passed or failed?
- Are sensitive fields redacted enough for your repo?
- Is anything missing for debugging?
- Would this be better than your current logs?

## CI Trial

```bash
npm run dev -- run --scenario quote-expired --ci
```

Expected exit code: `1`.

Ask:

- Would this signal be useful in CI?
- Would it block too often?
- Which failures should be warnings instead of blockers?

## Trial Outcome

Mark one:

- `completed`: user ran built-in and custom fixture successfully.
- `partial`: user ran built-in only or needed heavy assistance.
- `blocked`: setup, docs, or model confusion prevented trial.
- `not_relevant`: user does not have a flow where Gauntlet fits.
