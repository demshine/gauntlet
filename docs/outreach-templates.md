# Outreach Templates

Use these messages to recruit validation users. Keep outreach specific to the person's project; do not pitch Gauntlet as a finished safety product.

## Warm Intro

Subject: Quick feedback on agent payment test scenarios

Hi {{name}},

I am validating a small open-source CLI called Gauntlet for testing agent-payment demo flows before real money or provider calls are involved.

It focuses on failure cases like amount drift, duplicate retry, wrong merchant, quote expiry, and budget checks. The current version is local-only and emits redacted debug receipts.

Could I get 30 minutes to understand how you test {{project_or_flow}} today? I am especially looking for places where a generic test script misses payment-specific issues.

Useful next step from the call could be either:

- you telling me the idea is irrelevant for your flow, or
- trying one fixture-based run against a realistic demo.

## Cold DM

Hi {{name}}, I saw {{specific_project_or_demo}} and noticed it has an agent/payment or paid-tool angle.

I am testing whether developers need a local failure-case harness for flows like this. It covers quote expiry, amount drift, duplicate idempotency keys, wrong merchant, and redacted receipts.

Would you be open to a 20-30 minute feedback call? I am not asking you to buy anything; I am trying to learn whether this is better than the small scripts teams already write.

## GitHub Issue Or Discussion Reply

This is related to a validation project I am working on: a local CLI for testing payment-specific agent/tool failure cases before a demo touches real provider calls.

If useful, I can try mapping your flow into a fixture and share what scenarios it catches or misses. The current scope is intentionally local-only: no hosted API, no merchant verification, no real payments.

## Follow-Up After Interview

Thanks again for walking through your flow.

My notes:

- Current testing method: {{current_testing_method}}
- Relevant scenarios: {{relevant_scenarios}}
- Main concern: {{main_concern}}
- Possible next step: {{next_step}}

If you are still open to it, the lowest-friction trial is:

```bash
npm install
npm run build
npm run dev -- init
npm run dev -- run
```

Then we can replace the generated fixture with one realistic request from your demo.

## Ask For Scenario Contribution

One thing that would help most is a scenario description, even without private data:

- What the agent tried to pay for
- What should have happened
- What went wrong or could go wrong
- Which fields would identify the issue
- Whether it should fail policy, require review, or only warn

I can convert that into a redacted fixture shape.
