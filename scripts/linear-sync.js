#!/usr/bin/env node
/**
 * PropFlow — Linear Issue Sync
 * ============================
 * Connects PropFlow's build pipeline to the Linear free tier workspace.
 * Called from three places automatically:
 *   1. When a Gate OPENS    → creates a "completed" issue (feature shipped)
 *   2. When a Gate CLOSES   → creates a "bug" issue with failing test details
 *   3. When 3 fix attempts fail → creates an "Urgent" escalation issue
 *
 * Linear free tier: 250 active issues. Archive completed issues to stay
 * under the cap. This script auto-archives the "shipped" issues so the
 * active count only shows in-progress and blocked items.
 *
 * Environment variables required (add to .env.local, never commit):
 *   LINEAR_API_KEY   — from Linear Settings > API > Personal API Keys
 *   LINEAR_TEAM_ID   — from Linear Settings > Team > General (the UUID)
 *
 * Usage (called by log-results.js automatically):
 *   node scripts/linear-sync.js create-feature "P2-RecordPaymentModal" "open"
 *   node scripts/linear-sync.js create-bug "P2-RecordPaymentModal" "Save button not visible on mobile"
 *   node scripts/linear-sync.js create-escalation "P2-RecordPaymentModal" "3 fix attempts failed"
 */
'use strict';

const https = require('https');

// Read env from .env.local if running outside of a shell that already has them
function loadEnv() {
  const fs   = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}
loadEnv();

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID || '';

if (!LINEAR_API_KEY || !LINEAR_TEAM_ID) {
  // Silently exit — Linear is optional. Build continues without it.
  process.exit(0);
}

// Simple GraphQL POST to Linear's API
function linearQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req  = https.request({
      hostname: 'api.linear.app',
      path:     '/graphql',
      method:   'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': LINEAR_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end',  ()  => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Priority levels for Linear (1=urgent, 2=high, 3=medium, 4=low)
const PRIORITY = { urgent: 1, high: 2, medium: 3, low: 4 };

async function createIssue({ title, description, priority = 3, labelName }) {
  const mutation = `
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
          url
        }
      }
    }
  `;
  const result = await linearQuery(mutation, {
    input: {
      teamId:      LINEAR_TEAM_ID,
      title,
      description,
      priority,
    }
  });
  return result?.data?.issueCreate?.issue;
}

async function archiveIssue(issueId) {
  const mutation = `
    mutation ArchiveIssue($id: String!) {
      issueArchive(id: $id) { success }
    }
  `;
  await linearQuery(mutation, { id: issueId });
}

// ── Main ────────────────────────────────────────────────────────────────────
const [,, action, feature, detail] = process.argv;

async function main() {
  try {
    if (action === 'create-feature') {
      // Gate OPENED — feature shipped. Create + immediately archive
      // (keeps active issue count low on free tier)
      const issue = await createIssue({
        title: `[SHIPPED] ${feature}`,
        description: `Feature gate opened. All tests passing on Desktop Chrome and Mobile iPhone 14.\n\nDetail: ${detail || 'Gate OPEN'}`,
        priority: PRIORITY.low,
      });
      if (issue) {
        console.log(`Linear: Created issue ${issue.identifier} — ${issue.url}`);
        // Archive immediately since feature is complete
        await archiveIssue(issue.id);
        console.log(`Linear: Archived ${issue.identifier} (keeps free tier under 250 cap)`);
      }
    } else if (action === 'create-bug') {
      // Gate CLOSED — failing test detected
      const issue = await createIssue({
        title: `[BUG] ${feature}`,
        description: `Gate closed. Failing test detected.\n\nError: ${detail || 'See TESTING.md'}\n\nSelf-healing cycle activated. Check TESTING.md Known Issues.`,
        priority: PRIORITY.high,
      });
      if (issue) {
        console.log(`Linear: Bug issue ${issue.identifier} — ${issue.url}`);
      }
    } else if (action === 'create-escalation') {
      // 3 fix attempts failed — escalation needed from Arif
      const issue = await createIssue({
        title: `[ESCALATION] ${feature} — Manual Review Required`,
        description: `Self-healing failed after 3 attempts.\n\nLast error: ${detail || 'See TESTING.md escalation entry'}\n\nArif needs to review before build can continue.`,
        priority: PRIORITY.urgent,
      });
      if (issue) {
        console.log(`Linear: Escalation ${issue.identifier} — ${issue.url}`);
      }
    }
  } catch (e) {
    // Never crash the build pipeline over a Linear error
    process.stderr.write(`Linear sync error (non-blocking): ${e.message}\n`);
  }
}

main();
