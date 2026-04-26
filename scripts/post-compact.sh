#!/usr/bin/env bash
# PropFlow — Post-Compact Hook
# Fires immediately after context compaction completes.
# The context window is now fresh and nearly empty.
# This script re-injects SESSION.md + recent PROMPTS.md entries +
# current TESTING.md Gate status into Claude's fresh context via stdout.
# PostCompact stdout IS visible to Claude — this is the recovery mechanism.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SESSION_MD="$ROOT/SESSION.md"
PROMPTS_MD="$ROOT/PROMPTS.md"
TESTING_MD="$ROOT/TESTING.md"

echo "=== CONTEXT RESTORED AFTER COMPACTION ==="
echo ""

if [ -f "$SESSION_MD" ]; then
  echo "--- SESSION HANDOVER ---"
  cat "$SESSION_MD"
  echo ""
fi

if [ -f "$PROMPTS_MD" ]; then
  echo "--- LAST 3 PROMPT ENTRIES ---"
  # Extract the last 3 entry blocks (each starts with ## Entry #)
  TOTAL=$(grep -c "^## Entry #" "$PROMPTS_MD" 2>/dev/null || echo 0)
  if [ "$TOTAL" -gt 0 ]; then
    START=$((TOTAL > 3 ? TOTAL - 3 : 1))
    grep -n "^## Entry #" "$PROMPTS_MD" | tail -3 | while IFS=: read -r ln rest; do
      sed -n "${ln},$((ln + 16))p" "$PROMPTS_MD"
      echo ""
    done
  fi
fi

if [ -f "$TESTING_MD" ]; then
  echo "--- CURRENT GATE STATUS ---"
  tail -25 "$TESTING_MD"
  echo ""
fi

echo "=== RESUME INSTRUCTIONS ==="
echo "1. Read SESSION.md above. Continue the exact task described there."
echo "2. Check for PENDING entries in PROMPTS.md above. Fill them in."
echo "3. If Gate was CLOSED before compaction — it is still CLOSED."
echo "4. Do NOT re-introduce yourself. Do NOT ask what to work on."
echo "5. Pick up exactly where the session left off. Begin now."
echo "==========================================="

exit 0
