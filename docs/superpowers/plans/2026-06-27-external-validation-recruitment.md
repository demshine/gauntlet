# External Validation Recruitment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Gauntlet ready for public external validation, qualify 30 real agent-payment builders, and send a compliant first wave of 10 personalized invitations.

**Architecture:** Public-readiness changes remain in the repository, while candidate contact data and raw outreach records live in a locally excluded `validation-private/` directory. GitHub is used for repository administration, candidate discovery, and only context-appropriate outreach; anonymized outcomes roll up into the tracked validation documents.

**Tech Stack:** Git, GitHub CLI/API, Markdown, npm, TypeScript, Vitest

---

## File Structure

- Create `LICENSE`: grant MIT permission for public use and contribution.
- Create `CONTRIBUTING.md`: explain setup, verification, scenario contributions, redaction, and PR expectations.
- Modify `README.md`: state license, contribution path, validation status, and public V0.1 limitations.
- Inspect `package.json`: retain the npm publication-blocking `private` flag because repository visibility does not authorize package publication.
- Modify `tasks.md`: add and track the recruitment launch tasks.
- Create local-only `validation-private/recruitment-ledger.csv`: store candidate and outreach operations without committing contact data.
- Create local-only `validation-private/first-wave-messages.md`: stage the 10 personalized messages for quality review.
- Modify `docs/validation-tracker.md`: add only anonymized aggregate evidence after real responses arrive.

### Task 1: Public-Readiness Documentation

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Modify: `README.md`
- Modify: `tasks.md`

- [ ] **Step 1: Add the MIT license**

Create `LICENSE` with this text:

```text
MIT License

Copyright (c) 2026 demshine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 2: Add contribution guidance**

Create `CONTRIBUTING.md` with these exact sections:

```markdown
# Contributing to Gauntlet

## Before You Start
Gauntlet V0.1 is a local test harness, not a production payment authorization system.

## Development
Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build`.

## Scenario Contributions
Follow `docs/scenario-authoring.md` and use the scenario contribution issue form.

## Sensitive Data
Never commit secrets, payment credentials, personal data, or unredacted production fixtures.

## Pull Requests
Keep changes focused, add tests for behavior changes, and describe the payment failure case being modeled.
```

- [ ] **Step 3: Update the README**

Add a `Contributing` section linking to `CONTRIBUTING.md` and a `License` section linking to `LICENSE`. Add one sentence under V0.1 scope stating that external validation is active and linking to `docs/external-validation-plan.md`.

- [ ] **Step 4: Preserve the package publication boundary**

Confirm `package.json` retains:

```json
"private": true
```

Do not run `npm publish` and do not add registry release configuration. Public repository access does not imply an npm release.

- [ ] **Step 5: Track launch tasks**

Append these items under Phase 9 in `tasks.md` before T068:

```markdown
- [ ] T067B Complete public-readiness audit and publish the repository.
- [ ] T067C Qualify 30 external validation candidates.
- [ ] T067D Send 10 personalized first-wave invitations.
```

- [ ] **Step 6: Verify repository changes**

Run:

```bash
git diff --check
npm run typecheck
npm test
npm run build
```

Expected: no whitespace errors, 17 test files and 44 tests pass, and both TypeScript commands exit 0.

- [ ] **Step 7: Commit public-readiness changes**

```bash
git add LICENSE CONTRIBUTING.md README.md tasks.md
git commit -m "Prepare repository for public validation"
```

### Task 2: Public-Exposure Audit

**Files:**
- Inspect: all tracked files and Git history
- Modify: files containing unsafe material, only if findings exist

- [ ] **Step 1: Enumerate tracked and ignored risk surfaces**

Run:

```bash
git status --short
git ls-files
git ls-files --others --ignored --exclude-standard
```

Expected: `node_modules/`, `dist/`, generated receipts, and unredacted JSON remain ignored; no unexpected tracked secret files appear.

- [ ] **Step 2: Scan the current tree for credential patterns**

Run:

```bash
git grep -nEI '(api[_-]?key|secret|token|password|private[_-]?key|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)' -- ':!package-lock.json' ':!docs/superpowers/**'
```

Expected: only explanatory documentation or schema field names; inspect every result manually.

- [ ] **Step 3: Scan all reachable history**

Run:

```bash
git log -p --all -- . ':!package-lock.json' | rg -n -i '(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY|password\s*[:=]|secret\s*[:=])'
```

Expected: no live credential material. Stop publication and rotate/remove any confirmed secret before continuing.

- [ ] **Step 4: Verify public-facing limitations**

Run:

```bash
rg -n "does not approve payments|does not.*move funds|local-only|production" README.md "Gauntlet PRD.md" CONTRIBUTING.md
```

Expected: README and contribution guidance clearly prevent production-security misrepresentation.

- [ ] **Step 5: Record audit completion**

Mark T067B complete only after Tasks 1-2 pass and repository visibility is later confirmed as `PUBLIC`.

### Task 3: Local Recruitment Ledger

**Files:**
- Modify locally: `.git/info/exclude`
- Create locally: `validation-private/recruitment-ledger.csv`
- Create locally: `validation-private/first-wave-messages.md`

- [ ] **Step 1: Exclude private validation operations locally**

Append this line to `.git/info/exclude`:

```text
validation-private/
```

This exclusion is local and must not be committed.

- [ ] **Step 2: Create the candidate ledger schema**

Create `validation-private/recruitment-ledger.csv` with this header:

```csv
candidate_id,github_handle,category,project_url,evidence_of_fit,contact_channel,channel_url,qualified,status,outreach_date,follow_up_date,response,next_action
```

- [ ] **Step 3: Create the message review file**

Create `validation-private/first-wave-messages.md` with one section per candidate containing: candidate ID, public project evidence, channel justification, message text, and review status.

- [ ] **Step 4: Verify private files cannot be committed accidentally**

Run:

```bash
git check-ignore -v validation-private/recruitment-ledger.csv validation-private/first-wave-messages.md
git status --short
```

Expected: both files are excluded by `.git/info/exclude` and absent from Git status.

### Task 4: Qualify 30 Candidates

**Files:**
- Modify locally: `validation-private/recruitment-ledger.csv`

- [ ] **Step 1: Search recent MCP payment projects**

Use GitHub repository search with `sort=updated`, collecting projects updated since 2025-06-01:

```bash
gh api search/repositories -f q='mcp payment pushed:>=2025-06-01' -f sort=updated -f per_page=50
gh api search/repositories -f q='mcp commerce pushed:>=2025-06-01' -f sort=updated -f per_page=50
```

- [ ] **Step 2: Search recent x402 and agent-wallet projects**

```bash
gh api search/repositories -f q='x402 agent pushed:>=2025-06-01' -f sort=updated -f per_page=50
gh api search/repositories -f q='"agent wallet" pushed:>=2025-06-01' -f sort=updated -f per_page=50
```

- [ ] **Step 3: Inspect each candidate's public evidence**

For each candidate, inspect README, recent commits, owner profile, Discussions availability, contribution guidance, and relevant payment issues. Record only candidates with a concrete flow and an appropriate contact channel.

- [ ] **Step 4: Balance the 30-person cohort**

Qualify this mix:

```text
12 MCP paid-tool or agent tool-payment builders
6 x402 or paid API builders
5 wallet or payment infrastructure builders
5 agent application builders
2 DevRel or hackathon demo builders
```

- [ ] **Step 5: Validate the ledger**

Run a CSV row count and duplicate check. Expected: exactly 30 qualified data rows, 30 unique candidate IDs, and no duplicate GitHub handles.

- [ ] **Step 6: Mark sourcing complete**

Mark T067C complete in `tasks.md`, commit only that task-state update, and keep the ledger local.

### Task 5: Prepare And Review First-Wave Messages

**Files:**
- Modify locally: `validation-private/first-wave-messages.md`
- Modify locally: `validation-private/recruitment-ledger.csv`

- [ ] **Step 1: Rank the first wave**

Select 10 candidates using this order: concrete payment flow, recent activity, strong scenario fit, explicit contact channel, and cohort diversity.

- [ ] **Step 2: Draft each message**

Use the cold-DM structure in `docs/outreach-templates.md`, replacing every generic field with one verified project detail. Ask for either a 20-30 minute discovery conversation or one fixture-based trial.

- [ ] **Step 3: Run message quality checks**

Each message must pass all checks:

```text
mentions one verified project detail
states Gauntlet is local-only V0.1
does not claim production safety
contains one clear ask
contains no invented familiarity or endorsement
uses a channel intended for discussion or collaboration
is not posted to an unrelated issue
```

- [ ] **Step 4: Record approved messages**

Set each selected candidate's ledger status to `ready_to_contact` only after all checks pass.

### Task 6: Publish The Repository

**Files:**
- GitHub repository settings

- [ ] **Step 1: Push the implementation branch**

```bash
git push -u origin codex/external-validation-recruitment
```

- [ ] **Step 2: Open and merge the pull request after CI passes**

Create a PR describing public-readiness documentation and external-validation operations. Confirm GitHub Actions completes successfully, merge to `main`, and sync local `main`.

- [ ] **Step 3: Change repository visibility**

Run:

```bash
gh repo edit demshine/gauntlet --visibility public --accept-visibility-change-consequences
```

- [ ] **Step 4: Verify public access and CI**

Run:

```bash
gh repo view demshine/gauntlet --json visibility,isPrivate,url,defaultBranchRef
gh run list --repo demshine/gauntlet --branch main --limit 1 --json status,conclusion,url
```

Expected: `visibility` is `PUBLIC`, `isPrivate` is `false`, default branch is `main`, and the latest CI conclusion is `success`.

- [ ] **Step 5: Complete T067B**

Mark T067B complete in `tasks.md`, commit, push through a PR, and merge after CI passes.

### Task 7: Send The First Wave

**Files:**
- Modify locally: `validation-private/recruitment-ledger.csv`

- [ ] **Step 1: Recheck every target immediately before posting**

Confirm the project detail, target identity, channel rules, and message preview still match. Skip any target whose channel no longer permits the message.

- [ ] **Step 2: Send 10 personalized invitations**

Post only the approved message for each target through its recorded GitHub-native channel. Do not batch identical text and do not contact replacement candidates without running the same quality checks.

- [ ] **Step 3: Capture auditable delivery records**

For each sent message, record the date, public URL, status `contacted`, and next action. Do not commit private scheduling or contact details.

- [ ] **Step 4: Verify the first wave**

Expected: 10 unique qualified candidates have 10 accessible message URLs, no duplicate message body, and no unrelated issue was opened.

- [ ] **Step 5: Mark T067D complete**

Mark T067D complete in `tasks.md`, commit the task-state update, and merge it through CI.

### Task 8: Response Operations

**Files:**
- Modify locally: `validation-private/recruitment-ledger.csv`
- Modify: `docs/validation-tracker.md`

- [ ] **Step 1: Classify responses**

Move each response through the defined states and record `declined`, `not_relevant`, `no_response`, or the next qualified step without rewriting negative evidence.

- [ ] **Step 2: Schedule qualified interviews or trials**

Use `docs/interview-guide.md` before product demonstration and `docs/integration-trial.md` only after confirming a relevant flow.

- [ ] **Step 3: Update anonymized rollups**

Increment only evidence-backed totals in `docs/validation-tracker.md`. Keep raw notes and personal details out of Git.

- [ ] **Step 4: Review the first cycle**

After 10 messages or 10 business days, whichever is later, continue if there are at least two qualified replies or one scheduled trial. Otherwise revise positioning before sending a second wave.
