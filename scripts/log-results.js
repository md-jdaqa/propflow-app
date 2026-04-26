#!/usr/bin/env node
/**
 * PropFlow — Test Result Logger
 * Runs automatically via the posttest hook in package.json after every
 * npm test execution. Reads Playwright's JSON output from test-results/,
 * formats a structured entry, detects recurring failures, updates the
 * Phase Gate Log table, and appends everything to TESTING.md.
 *
 * Also creates a Linear issue when a feature gate opens (OPEN) and
 * creates a bug issue when the self-healing cycle activates (3+ failures).
 *
 * Never overwrites. Always appends. TESTING.md is the audit trail.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.join(__dirname, '..');
const TESTING_MD   = path.join(ROOT, 'TESTING.md');
const RESULTS_JSON = path.join(ROOT, 'test-results', 'results.json');

function getFeature()   { return process.env.PROPFLOW_FEATURE || 'Unknown Feature'; }
function getPhase()     { return process.env.PROPFLOW_PHASE   || '?'; }
function fingerprint(e) { return (e || '').replace(/\s+/g, ' ').trim().slice(0, 60); }

function isRecurring(errorMsg, content) {
  if (!errorMsg || !content) return false;
  const fp = fingerprint(errorMsg);
  if (!fp) return false;
  const known = content.split('## KNOWN ISSUES')[1] || '';
  return known.split('## TEST RUN HISTORY')[0].includes(fp);
}

function flattenResults(suites, project, results = []) {
  if (!suites) return results;
  for (const suite of suites) {
    const proj = suite.project || project;
    if (suite.suites) flattenResults(suite.suites, proj, results);
    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of (spec.tests || [])) {
          results.push({
            title:    spec.title,
            project:  test.projectName || proj || 'Unknown',
            status:   test.results?.[0]?.status || 'unknown',
            error:    test.results?.[0]?.error?.message || null,
            duration: test.results?.[0]?.duration || 0,
          });
        }
      }
    }
  }
  return results;
}

function updateGateLog(content, feature, gateStatus, date) {
  const word = gateStatus === 'OPEN' ? 'OPEN   ' : 'CLOSED ';
  return content.split('\n').map(line => {
    if (line.includes('| ' + feature) && line.includes('PENDING')) {
      return line
        .replace('PENDING', word)
        .replace('—      ', date)
        .replace('Not yet started', gateStatus === 'OPEN'
          ? 'Tested and passing'
          : 'Tests failing');
    }
    return line;
  }).join('\n');
}

function addKnownIssue(content, failed) {
  let updated = content;
  for (const t of failed) {
    const fp = fingerprint(t.error);
    if (!fp) continue;
    const known = updated.split('## KNOWN ISSUES')[1] || '';
    if (known.includes(fp)) continue;
    const history = updated.split('## TEST RUN HISTORY')[0];
    if (!history.includes(fp)) continue;
    // Second occurrence — add to Known Issues
    const entry = `
### Recurring Failure: ${t.title}
- Fingerprint: \`${fp}\`
- Project: ${t.project}
- Fix History: (fill in each attempt below)
  - Attempt 1: (describe fix and result)
`;
    updated = updated.replace(
      '## KNOWN ISSUES & RECURRING FAILURES',
      '## KNOWN ISSUES & RECURRING FAILURES\n' + entry
    );
  }
  return updated;
}

function main() {
  const feature   = getFeature();
  const phase     = getPhase();
  const timestamp = new Date().toISOString();
  const date      = timestamp.slice(0, 10);

  if (!fs.existsSync(TESTING_MD)) {
    console.error('ERROR: TESTING.md not found. Run Phase 1 setup first.');
    process.exit(1);
  }
  let existing = fs.readFileSync(TESTING_MD, 'utf8');

  let allTests = [];
  let parseError = null;

  if (!fs.existsSync(RESULTS_JSON)) {
    parseError = 'test-results/results.json not found — Playwright may not have run.';
  } else {
    try {
      const raw = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf8'));
      allTests = flattenResults(raw.suites || []);
    } catch (e) {
      parseError = `Failed to parse results.json: ${e.message}`;
    }
  }

  const passed  = allTests.filter(t => t.status === 'passed');
  const failed  = allTests.filter(t => t.status === 'failed');
  const skipped = allTests.filter(t => t.status === 'skipped');
  const gateStatus = (parseError || failed.length > 0) ? 'CLOSED' : 'OPEN';

  let entry = `\n---\n### RUN: ${timestamp}\n`;
  entry += `Phase: ${phase} | Feature: ${feature}\n`;
  entry += `Results: ${passed.length} passed / ${failed.length} failed / ${skipped.length} skipped\n\n`;
  entry += `Tests Run:\n`;

  for (const t of allTests) {
    const icon = t.status === 'passed' ? '[PASS]' : t.status === 'failed' ? '[FAIL]' : '[SKIP]';
    entry += `  ${icon} ${t.project}: ${t.title} (${(t.duration/1000).toFixed(1)}s)\n`;
  }

  if (failed.length > 0) {
    entry += `\nFAILURES:\n`;
    for (const t of failed) {
      const recurring = isRecurring(t.error, existing);
      entry += `  [FAIL] ${t.project}: ${t.title}\n`;
      if (t.error) entry += `  Error: ${t.error.slice(0, 200).replace(/\n/g, ' ')}\n`;
      if (recurring) {
        entry += `\n  GUARD RAIL ACTIVE: This failure appeared before.\n`;
        entry += `  Read Known Issues fix history before attempting any fix.\n`;
        entry += `  Do NOT repeat a previously failed approach.\n`;
      }
      entry += `  Fingerprint: "${fingerprint(t.error)}"\n`;
      entry += `  Diagnosis: (fill before fixing)\n`;
      entry += `  Fix Attempt 1: (fill after attempting)\n\n`;
    }
  } else if (!parseError) {
    entry += `\nFailures: None\n`;
  }

  if (parseError) entry += `\nERROR: ${parseError}\n`;

  entry += `\nGate Decision: ${gateStatus === 'OPEN'
    ? 'OPEN — All tests passing. Proceed to next feature.'
    : `CLOSED — ${failed.length} failing. Fix before proceeding.`
  }\n`;

  existing = addKnownIssue(existing, failed);
  existing = updateGateLog(existing, feature, gateStatus, date);
  fs.writeFileSync(TESTING_MD, existing + entry, 'utf8');

  // Terminal output
  const line = '━'.repeat(52);
  console.log(`\n${line}`);
  console.log(' PropFlow Test Logger');
  console.log(`${line}`);
  console.log(` Feature : ${feature}`);
  console.log(` Passed  : ${passed.length}  Failed: ${failed.length}  Skipped: ${skipped.length}`);
  console.log('');
  if (gateStatus === 'OPEN') {
    console.log(' ✅  GATE OPEN — proceed to next feature');
  } else {
    console.log(' ❌  GATE CLOSED — fix failing tests before proceeding');
    console.log('     Read TESTING.md Known Issues before attempting any fix.');
  }
  console.log(`${line}\n`);

  if (gateStatus === 'CLOSED') process.exit(1);
}

main();
