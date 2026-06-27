# External Validation Recruitment Design

## Objective

Recruit real agent-payment builders to test whether Gauntlet solves a meaningful problem before V0.2 work begins. The first cycle should produce qualified conversations and hands-on trials, not broad awareness metrics.

## Repository Access

Change `demshine/gauntlet` from private to public before outreach starts. The repository must contain no secrets, private interview notes, personal contact details, or unredacted user fixtures. Raw interview notes and contact details remain local; only anonymized validation summaries may be committed.

## Target Cohort

Build a pipeline of 30 candidates using recent public evidence of relevant work:

- MCP servers or tools with paid-tool, commerce, wallet, or purchase flows
- x402 or paid API demos
- agent wallets and payment infrastructure
- agent applications that initiate tool-mediated payments
- DevRel or hackathon builders with an agent-payment demo

Prioritize candidates with an active public repository, a concrete payment flow, recent activity, and an explicit contact or community channel. Exclude generic AI projects with no payment flow and inactive projects without usable evidence.

## First-Wave Execution

Contact the 10 highest-fit candidates first. Each message must mention one specific public project detail and ask for a 20-30 minute discovery call or a small fixture-based trial. Do not describe Gauntlet as production payment security or merchant verification.

Use GitHub-native contact points only when appropriate:

- A repository Discussion category that permits project questions or collaboration
- A directly relevant open issue where offering a fixture mapping is useful to the existing conversation
- A public profile contact link explicitly provided by the developer

Do not open unrelated issues for promotion, mass-mention users, or post duplicate messages. Send at most one follow-up after five business days.

## Candidate Record

Maintain a local recruitment ledger with:

- candidate ID and public GitHub handle
- category and relevant project URL
- evidence of fit
- permitted contact channel
- outreach date and message
- response status and next action

Commit only public project references and anonymized rollups. Do not commit personal email addresses, scheduling details, or raw conversation notes.

## Validation Flow

For interested candidates:

1. Run discovery using `docs/interview-guide.md` before demonstrating the product.
2. Record current testing behavior, recent failures, scenario relevance, and willingness to trial.
3. Invite qualified candidates to complete `docs/integration-trial.md`.
4. Ask for one redacted or synthetic fixture-shaped flow.
5. Capture timing, confusion points, receipt usefulness, and whether they would keep Gauntlet in their repository.
6. Update `docs/validation-tracker.md` with anonymized aggregate evidence.

## Operational States

Each candidate moves through:

`identified -> qualified -> contacted -> replied -> interviewed -> trial_scheduled -> trial_completed`

Terminal states are `declined`, `not_relevant`, `no_response`, and `blocked`. A candidate may enter a trial only after confirming a relevant real or semi-real payment flow.

## First-Cycle Success Criteria

Review the first wave after 10 personalized messages or 10 business days, whichever comes later. Continue sourcing if the wave produces at least two qualified replies or one scheduled trial. Rewrite positioning before the second wave if it produces no qualified replies.

The overall validation targets remain:

- 20 target-user interviews
- 5 real or semi-real demo flows
- 3 completed external integrations
- 1 non-friend scenario proposal
- evidence for the continue or pivot gates in `docs/external-validation-plan.md`

## Safety And Quality Controls

- Inspect repository history and tracked files for secrets before making it public.
- Keep user-provided fixtures redacted and local unless explicit permission is recorded.
- Do not imply endorsement from contacted developers.
- Stop contacting anyone who declines.
- Record negative evidence with the same weight as positive feedback.
- Do not start V0.2 feature work until the external validation gates are reviewed.

## Verification

Before outreach begins:

- repository visibility is confirmed as public
- default branch CI is passing
- README accurately states V0.1 limitations
- issue templates work for external users
- recruitment ledger contains 30 qualified candidates
- the first 10 messages pass personalization and channel checks

After the first wave, verify GitHub links, sent-message locations, response counts, scheduled calls, and tracker updates against the recruitment ledger.
