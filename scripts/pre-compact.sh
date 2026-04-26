#!/usr/bin/env bash
# PropFlow — Pre-Compact Hook
# Fires automatically before every Claude Code context compaction.
# Three jobs: archive the raw transcript, write SESSION.md handover,
# and output custom compaction instructions via stdout so the summary
# preserves what actually matters (not just whatever Claude decides).

set -euo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null || echo 'unknown')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""' 2>/dev/null || echo '')

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TRANSCRIPTS_DIR="$ROOT/.claude/transcripts"
SESSION_MD="$ROOT/SESSION.md"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Archive the full transcript before it gets compacted
mkdir -p "$TRANSCRIPTS_DIR"
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  cp "$TRANSCRIPT_PATH" "$TRANSCRIPTS_DIR/${SESSION_ID}_${TIMESTAMP}.jsonl" 2>/dev/null || true
fi

# Write the SESSION.md handover summary
# Claude Code is expected to fill in the placeholder sections
cat > "$SESSION_MD" << SESSIONEOF
# SESSION.md — PropFlow Build Handover
# Written by pre-compact.sh at $TIMESTAMP | Session: $SESSION_ID

## What Was Being Built
(Claude Code: read last 20 lines of PROMPTS.md and state the active feature)

## Key Decisions This Session
(Claude Code: list 3-5 most important decisions from PROMPTS.md entries)

## Files Modified This Session
(Claude Code: list all files touched since last ACCEPTED PROMPTS.md entry)

## Current Gate Status
(Claude Code: read TESTING.md bottom 30 lines and state Gate status)

## Next Action
(Claude Code: state the exact next step — phase, feature name, test IDs)

## Pending Arif Verdicts
(Claude Code: list PROMPTS.md entries with Arif Verdict still PENDING)

## Current Version
(Claude Code: read src/lib/version.ts and state APP_VERSION)

## Active Linear Issues
(Claude Code: list any open Linear issues from this session)
SESSIONEOF

# Compaction instructions via stdout — shapes what Claude preserves
cat << 'INSTRUCTIONS'
COMPACTION INSTRUCTIONS — preserve all of:
1. Every PENDING entry from PROMPTS.md that has no Arif Verdict yet
2. Current Gate status from TESTING.md (OPEN/CLOSED and which feature)
3. Active feature being built (phase, feature name, test IDs in progress)
4. All file paths modified this session
5. Current version from src/lib/version.ts
6. Any active self-healing cycle and which attempt number
7. Tailscale IP used for phone testing
8. Any open escalation waiting for Arif

Do NOT preserve:
- Full file contents already read (re-read when needed)
- Resolved error stack traces
- Passing test output details
- Conversation pleasantries or meta-discussion
INSTRUCTIONS

exit 0
