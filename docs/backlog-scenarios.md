# Backlog Scenarios

These scenarios are intentionally outside the V0.1 must-have set. They should be promoted only when user interviews or external integrations show they are valuable.

## Candidate Scenarios

1. `unknown-merchant`
   - Payment targets a merchant absent from allow/block fixtures.

2. `wrong-chain`
   - Payment request uses an unexpected network.

3. `expired-policy`
   - Agent attempts payment after policy expiry.

4. `retry-without-original-request-id`
   - Retry lacks linkage to the original request.

5. `repeated-payment-within-same-task`
   - Task-level payment count exceeds policy.

6. `missing-idempotency-key`
   - Request cannot be safely deduplicated.

7. `missing-quote-id`
   - Request cannot be tied back to a quote.

8. `requires-review-above-threshold`
   - Request is allowed by hard policy but exceeds review threshold.

9. `merchant-domain-mismatch`
   - Merchant domain differs from expected fixture.

10. `mcp-tool-payment-outside-allowed-tool`
    - MCP tool source is outside allowed paid tool scope.

11. `prompt-injection-change-merchant`
    - Prompt/tool output attempts to redirect payment to a new merchant.

12. `suspicious-tool-response-ignore-policy`
    - Tool response asks the agent to ignore payment policy.

## Promotion Criteria

Promote a backlog scenario to must-have only when:

- at least one target user has seen or strongly expects the failure
- fixture inputs can stay deterministic
- expected decision and reason codes are stable
- the scenario teaches something not already covered by the 8 must-have scenarios

