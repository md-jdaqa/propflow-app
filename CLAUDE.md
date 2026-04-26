# PropFlow — Claude Code Standing Instructions v8
# Auto-loaded every session before anything else runs.
# Target: under 300 lines. Full specs live in MVP docs v1-v5.
# ============================================================

## Project Identity
PropFlow: dark-mode-first, mobile-first, AI-powered property management SaaS.
Owner: Md Arifuzzaman (Arif) — Clevvar Estate, Brooklyn NY.
Repo: github.com/mdarifuzzaman1116/propflow-app
Stack: Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (DB + Auth +
  Storage + Realtime), Prisma ORM, Stripe, Playwright, Inngest, Resend, Twilio.
Linear workspace: propflow (free tier, archive issues when done to stay under 250).

## CRITICAL — Things Arif Has Had to Repeat That Must NEVER Happen Again
These are documented pain points from past sessions. Violating these wastes
Arif's time and breaks the hands-free promise of this project.

1. NEVER ask Arif to explain what PropFlow is or what he is building.
   Read SESSION.md and TESTING.md instead. The answer is always there.
2. NEVER ask which bookkeeping tool to use. PropFlow IS the bookkeeping tool.
   Zoho Books is only used for Arif's personal Clevvar Estate rental books,
   which is a completely separate concern from building PropFlow.
3. NEVER ask Arif what to work on next. Read TESTING.md Gate Log and
   SESSION.md. The next task is always specified there.
4. NEVER re-explain yourself after compaction. Read SESSION.md and continue.
5. NEVER ask for permission to run tests. Tests run automatically after
   every feature. That is the Gate Rule and it is non-negotiable.
6. NEVER implement something and then ask if you should commit. Commit
   passing features automatically with the correct commit message format.
7. NEVER output partial code and say "you can fill in the rest." Write
   complete, working code every time.
8. NEVER skip the mobile viewport test to save time. Both viewports must
   pass before any Gate opens.

---

## SESSION START — Do This First, Every Time, No Exceptions

1. Read SESSION.md — what was being worked on, what is next.
2. Read the last 30 lines of TESTING.md — current Gate status.
3. Read the last 3 entries of PROMPTS.md — any PENDING verdicts from Arif.
4. Post one line to Arif: "Last: [X]. Gate: [OPEN/CLOSED]. Next: [Y]. Starting."
5. Begin immediately. No preamble. No questions.

---

## THE GATE RULE

After every feature implementation, run both of these commands in order:

  PROPFLOW_FEATURE="[name]" npm test -- --project="Desktop Chrome" --grep "[name]"
  PROPFLOW_FEATURE="[name]" npm test -- --project="Mobile iPhone 14" --grep "[name]"

The posttest hook runs log-results.js automatically. TESTING.md updates itself.
If ALL tests pass on BOTH → Gate OPEN → commit → update CHANGELOG.md [Unreleased]
  → proceed to next feature.
If ANY fail → Gate CLOSED → read TESTING.md Known Issues → fix → re-run.
Gate does not open until both desktop AND mobile pass. No exceptions.

---

## SELF-HEALING GUARD RAIL

Before touching any code to fix a failing test:
1. Read TESTING.md Known Issues. Same error before? Read every prior fix attempt.
   Do NOT repeat an approach that already failed.
2. Re-read the MVP doc section for this feature. Is the code matching the spec?
3. Write a one-line diagnosis comment in the code BEFORE implementing the fix.
4. Fix → run failing test in isolation → run full feature suite → update TESTING.md.
After 3 failed attempts: stop, write escalation entry in TESTING.md, notify Arif.
Escalation priority: 5 (max) on ntfy with tag rotating_light.

---

## PROMPTS.md LOGGING

UserPromptSubmit hook runs log-prompt.js automatically on every Arif prompt.
After every response, fill in the most recent PENDING entry in PROMPTS.md:
  Response       — 1-3 sentences what you did
  Decision Made  — the specific choice made and why
  Files Changed  — every file touched
  Tests Run      — test IDs and pass/fail
  Notes          — rollback instructions
Leave Arif Verdict as PENDING. When Arif says "looks good" or similar →
update to ACCEPTED. When Arif pushes back → mark REJECTED, open new entry.

---

## CONTEXT WINDOW — FULLY AUTOMATED

Auto-compact threshold: 0.85. PreCompact hook saves transcript + writes SESSION.md.
PostCompact hook re-injects SESSION.md into fresh context. Nothing manual needed.
When context approaches 70%:
  - Use subagents for research: "use a subagent to investigate X"
  - Do not re-read files already in context
  - Do not repeat full error outputs — reference line numbers

---

## VERSIONING

One source of truth: package.json version field. Start at 0.0.0.
BEFORE any bump: npm run test:regression (zero failures required).
AFTER passing: npm run version:[patch|minor|major] 'Summary'
version-bump.sh handles everything: regression, package.json, version.ts,
version.json, CHANGELOG.md, git commit, tag, push, ntfy notification.
Footer always shows version. Clicking it opens changelog modal.

---

## LINEAR INTEGRATION

Linear free tier. Workspace: propflow. Archive issues to stay under 250 cap.
Every feature from TESTING.md Gate Log gets a Linear issue when work starts.
Claude Code creates the issue via Linear API, adds it to the current cycle,
and links the git commit to the issue when the Gate opens.
Issue format: [Phase]-[FeatureName] e.g. "P2-RecordPaymentModal"
Bug issues auto-created when self-healing cycle activates (3 attempts).
Escalation issues auto-created with priority Urgent when Gate closed > 24h.

---

## DECISION AUTONOMY

Make without asking:  CSS values, file choice, test writing, patch selection,
  PATCH/MINOR version choice, any feature from MVP v1-v5.
Ask before doing:  deleting committed files, schema migrations, removing an
  ACCEPTED feature, changing pricing/subscription logic, MAJOR bumps.

---

## MOBILE-FIRST RULES

Build for 390px first. Desktop added after. Touch targets min 44×44px.
No horizontal scroll at any viewport. Keyboard must not obscure action buttons.
Bottom nav fixed and visible when scrolling. Modals = bottom sheets on mobile.

---

## CODE QUALITY

TypeScript strict, no any. Zod on all API inputs. Parameterized queries only.
Sensitive fields encrypted AES-256-GCM before DB write. RLS on all tables.
Never commit .env.local. Never hardcode credentials anywhere.

---

## SCOPED REFERENCE FILES

Load these only when working on the relevant feature, not on every prompt:
  Themes & colors:          .claude/rules/themes.md
  Schedule E tax map:       .claude/rules/tax-categories.md
  Contractor notifications: .claude/rules/contractor-notifications.md
  Test specs Phase 1-3:     .claude/rules/test-specs-p1-p3.md
  Test specs Phase 4-9:     .claude/rules/test-specs-p4-p9.md
  Linear API patterns:      .claude/rules/linear-integration.md

Full specs: MVP docs v1-v5, Testing Protocol v4, v6 (versioning), v7 (prompts)
