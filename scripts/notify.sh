#!/usr/bin/env bash
# PropFlow — ntfy Push Notification
# Usage: bash scripts/notify.sh 'Title' 'Message' [priority 1-5] [tags]
# Priority: 1=min 2=low 3=default 4=high 5=max
# Tags: comma-separated, e.g. 'white_check_mark,rocket'
# Reads NTFY_TOPIC and NTFY_TOKEN from environment.
# Never crashes — notifications are best-effort, never block the build.

set -euo pipefail

TITLE="${1:-PropFlow}"
MESSAGE="${2:-No message}"
PRIORITY="${3:-3}"
TAGS="${4:-}"

NTFY_URL="${NTFY_URL:-https://ntfy.sh}"
NTFY_TOPIC="${NTFY_TOPIC:-}"
NTFY_TOKEN="${NTFY_TOKEN:-}"

if [ -z "$NTFY_TOPIC" ] || [ -z "$NTFY_TOKEN" ]; then
  echo 'notify.sh: NTFY_TOPIC or NTFY_TOKEN not set — skipping notification.'
  exit 0
fi

# Auto-detect Tailscale IP for the test URL in notifications
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo 'localhost')

ARGS=(
  -s
  -H "Title: $TITLE"
  -H "Priority: $PRIORITY"
  -H "Authorization: Bearer $NTFY_TOKEN"
  -d "$MESSAGE | Test: http://$TAILSCALE_IP:3000"
)

[ -n "$TAGS" ] && ARGS+=(-H "Tags: $TAGS")

curl "${ARGS[@]}" "$NTFY_URL/$NTFY_TOPIC" > /dev/null 2>&1 || true
