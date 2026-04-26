# Linear Integration Rules
# Load when creating issues, syncing build state, or working on the CI pipeline.

## Setup (done once in Phase 1)
Workspace: propflow (free tier)
Free tier limit: 250 active (non-archived) issues. Archive completed features.
Required env vars: LINEAR_API_KEY, LINEAR_TEAM_ID (add to .env.local, never commit)

## Automatic Issue Creation (handled by linear-sync.js)
Gate OPENS  → create [SHIPPED] issue at priority Low → immediately archive
              (keeps active count low, preserves history in archived)
Gate CLOSES → create [BUG] issue at priority High with failing test details
3 fix attempts fail → create [ESCALATION] issue at priority Urgent

## Issue Naming Convention
[SHIPPED]    P2-RecordPaymentModal — feature completed
[BUG]        P2-RecordPaymentModal — failing test details
[ESCALATION] P2-RecordPaymentModal — Manual Review Required

## Free Tier Management
Always archive SHIPPED issues immediately after creation.
If active issue count approaches 200, archive old SHIPPED issues in bulk.
Never archive BUG or ESCALATION issues — keep them visible until resolved.
