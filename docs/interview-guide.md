# Interview Guide

Use this for 30-minute discovery calls. Do not ask whether the user "would use Gauntlet" until after you understand their current workflow and recent failures.

## Before The Call

- Identify the user's category: MCP paid tool, paid API, wallet/payment infra, agent app, or DevRel/demo builder.
- Review any public repo, demo, or docs they have.
- Prepare to show `gauntlet run`, one failing scenario, and one redacted receipt only if they ask to see the tool.

## Call Structure

### 1. Context

- What are you building that involves agent-initiated or tool-mediated payment?
- Is the flow real, semi-real, or demo-only?
- What payment provider, wallet, x402-like flow, or MCP server shape are you using?
- Who needs to trust the payment decision: developer, end user, merchant, infra provider, or demo audience?

### 2. Current Testing Workflow

- How do you test payment failures today?
- Do you have custom scripts, unit tests, provider sandbox tests, or manual demo checklists?
- Which failure cases are already covered?
- Which failure cases are known but not tested?
- Has a demo or integration ever failed because of amount, quote, merchant, retry, budget, or stale state?

### 3. Scenario Relevance

Ask the user to rate each as `real`, `maybe`, or `not relevant`:

- Amount exceeds single payment limit.
- Cumulative budget exceeded.
- Blocked or wrong merchant.
- Wrong token, currency, chain, or network.
- Quote expired.
- Final amount drifted from quoted amount.
- Duplicate idempotency key or retry.
- Missing required metadata.

### 4. Receipt And Debugging

- What logs or receipts do you currently keep?
- Who reads them when something goes wrong?
- Would a redacted receipt be safe to store in a public demo repo?
- Which fields are missing from the current receipt?
- Which fields are too sensitive even after default redaction?

### 5. Trial Willingness

- Would you try a local CLI if it took 5 minutes to run built-in scenarios?
- Would you provide one real or semi-real fixture set?
- Would you keep a `gauntlet` fixture directory in your repo?
- Would CI failure be helpful, or would it add noise?
- Would you pay for custom scenarios, integration support, or payment policy review?

## Close

Ask for one concrete next step:

- Share a demo flow.
- Try the integration trial.
- Submit a scenario idea.
- Open a GitHub issue.
- Schedule an integration session.

## Evidence Notes

Record exact user language for:

- "This is painful because..."
- "I already solved this by..."
- "I would not use this because..."
- "This found something I missed..."
- "I would pay for..."
