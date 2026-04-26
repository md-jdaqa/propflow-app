#!/usr/bin/env node
/**
 * PropFlow — Prompt & Decision Logger
 * ====================================
 * Wired into Claude Code's UserPromptSubmit hook. Fires on every prompt
 * Arif submits. Appends a structured entry to PROMPTS.md and injects
 * a reminder into Claude Code's context window via stdout so Claude
 * actually fills in the response fields (not just logs the prompt).
 *
 * This uses the UserPromptSubmit hook specifically because its stdout IS
 * injected into Claude's context — unlike Stop hook stdout which only
 * prints to the terminal and Claude never sees.
 *
 * Minimum prompt length to log: 20 chars (skips short replies like "ok", "yes")
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const PROMPTS_MD   = path.join(ROOT, 'PROMPTS.md');
const COUNTER_FILE = path.join(ROOT, '.claude', 'prompt-counter.txt');

// Read JSON from stdin (Claude Code passes hook context as JSON)
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  let promptText = '', sessionId = 'unknown';
  try {
    const d = JSON.parse(raw);
    promptText = (d.prompt || '').trim();
    sessionId  = d.session_id || 'unknown';
  } catch { promptText = raw.trim().slice(0, 500); }

  // Skip very short prompts (single-word acknowledgements)
  if (promptText.length < 20) { process.exit(0); }

  // Increment sequential entry counter
  let counter = 1;
  try {
    const dir = path.dirname(COUNTER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(COUNTER_FILE))
      counter = parseInt(fs.readFileSync(COUNTER_FILE, 'utf8').trim(), 10) + 1;
    fs.writeFileSync(COUNTER_FILE, String(counter), 'utf8');
  } catch { counter = Date.now(); }

  const num  = String(counter).padStart(4, '0');
  const ts   = new Date().toISOString();

  // Auto-classify prompt type from keywords
  let type = 'GENERAL';
  if (/bug|broken|not working|doesn'?t|error|crash|fail/i.test(promptText))   type = 'BUG_REPORT';
  else if (/look|color|style|design|ui|ux|button|font|spacing|theme/i.test(promptText)) type = 'UI_CHANGE';
  else if (/add|build|create|implement|feature|want|need|include/i.test(promptText))    type = 'FEATURE_REQUEST';
  else if (/how|what|why|explain|can you|tell me/i.test(promptText))                    type = 'QUESTION';
  else if (/fix|change|update|modify|adjust|tweak|improve/i.test(promptText))           type = 'FIX_REQUEST';

  // Build the PROMPTS.md entry with placeholder fields Claude Code fills in
  const entry = `
---

## Entry #${num}
**Timestamp:** ${ts}
**Session:** ${sessionId.slice(0, 12)}
**Type:** ${type}
**Prompt:** ${promptText.replace(/\n/g, ' ').slice(0, 800)}${promptText.length > 800 ? '... [truncated]' : ''}
**Response:** [Claude Code: 1-3 sentence summary of what you did]
**Decision Made:** [Claude Code: specific choice made and why]
**Status:** PENDING
**Files Changed:** [Claude Code: list every file touched]
**Tests Run:** [Claude Code: test IDs and pass/fail]
**Arif Verdict:** PENDING
**Notes:** [Claude Code: rollback instructions if needed]

`;

  // Append to PROMPTS.md (never overwrite)
  if (!fs.existsSync(PROMPTS_MD)) {
    fs.writeFileSync(PROMPTS_MD,
      '# PropFlow — Prompt & Decision Log\n# Auto-created\n\n', 'utf8');
  }
  try {
    fs.appendFileSync(PROMPTS_MD, entry, 'utf8');
  } catch (e) {
    process.stderr.write(`log-prompt.js: ${e.message}\n`);
  }

  // Inject reminder into Claude's context via stdout
  // UserPromptSubmit stdout IS visible to Claude — this is intentional
  process.stdout.write(
    `[PROMPTS.md] Entry #${num} logged at ${ts}.\n` +
    `After responding, fill in Entry #${num} in PROMPTS.md:\n` +
    `  Response, Decision Made, Files Changed, Tests Run, Notes.\n` +
    `Leave Arif Verdict as PENDING. Do this before moving to next task.\n`
  );

  process.exit(0);
});
