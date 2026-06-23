# Scenario Library

## Must-Have Scenarios

### 1. valid-mcp-paid-tool-payment

- Risk represented: baseline known-good flow
- Expected decision: `policy_passed`
- Expected reason codes: `[]`
- Requires history: no

### 2. amount-exceeds-single-payment-limit

- Risk represented: agent attempts a payment above policy limit
- Expected decision: `policy_failed`
- Expected reason codes: `["amount_exceeds_single_payment_limit"]`
- Requires history: no

### 3. cumulative-budget-exceeded

- Risk represented: request is individually valid but exceeds task budget
- Expected decision: `policy_failed`
- Expected reason codes: `["cumulative_budget_exceeded"]`
- Requires history: yes

### 4. blocked-merchant

- Risk represented: payment targets a denied merchant fixture
- Expected decision: `policy_failed`
- Expected reason codes: `["blocked_merchant"]`
- Requires history: no

### 5. wrong-token-or-currency

- Risk represented: request uses wrong currency or token
- Expected decision: `policy_failed`
- Expected reason codes: `["currency_mismatch"]`
- Requires history: no

### 6. quote-expired

- Risk represented: payment request is created after quote expiry
- Expected decision: `policy_failed`
- Expected reason codes: `["quote_expired"]`
- Requires history: no

### 7. amount-drift-above-threshold

- Risk represented: final amount diverges from quote beyond policy tolerance
- Expected decision: `policy_failed`
- Expected reason codes: `["quote_amount_drift_exceeded"]`
- Requires history: no

### 8. duplicate-idempotency-key

- Risk represented: repeated charge risk within the same task
- Expected decision: `policy_failed`
- Expected reason codes: `["duplicate_idempotency_key"]`
- Requires history: yes

## Backlog Scenarios

1. unknown merchant
2. wrong chain
3. expired policy
4. retry without original_request_id
5. repeated payment within same task
6. missing idempotency key
7. missing quote_id
8. requires review above threshold
9. merchant domain mismatch
10. MCP tool asks for payment outside allowed tool
11. prompt injection attempts to change merchant
12. suspicious tool response asks agent to ignore payment policy

## Scenario Quality Bar

Each accepted scenario must:

- map to a real or high-confidence payment failure
- run locally without external services
- have stable expected decision and reason codes
- include receipt and report examples
- document whether it requires history

