#!/usr/bin/env node
/**
 * PropFlow — CHANGELOG.md Entry Manager
 * Called by version-bump.sh after npm version runs.
 * Reads the [Unreleased] section, converts it to a versioned entry
 * with today's date, and prepends a fresh empty [Unreleased] section.
 * Never deletes past entries. Append-only approach preserved.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const [,, version] = process.argv;
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
const today = new Date().toISOString().slice(0, 10);

if (!version) {
  console.error('Usage: node update-changelog.js [version]');
  process.exit(1);
}

const content  = fs.readFileSync(changelogPath, 'utf8');
const lines    = content.split('\n');

const unrelStart  = lines.findIndex(l => l.startsWith('## [Unreleased]'));
const nextVerLine = lines.findIndex((l, i) => i > unrelStart && l.startsWith('## ['));

if (unrelStart === -1) {
  console.error('No [Unreleased] section found in CHANGELOG.md');
  process.exit(1);
}

// Extract unreleased content and strip the empty placeholder line
const unrelContent = lines.slice(unrelStart + 1, nextVerLine === -1 ? lines.length : nextVerLine)
  .filter(l => l.trim() !== '- (add entries here as features are built)')
  .filter(l => l.trim() !== '- (add bug fixes here as they are resolved)')
  .filter(l => l.trim() !== '- (add UI or behavior changes here)');

// Build fresh [Unreleased] section
const freshUnreleased = [
  '## [Unreleased]',
  '### Added',
  '- (add entries here as features are built)',
  '',
  '### Fixed',
  '- (add bug fixes here as they are resolved)',
  '',
  '### Changed',
  '- (add UI or behavior changes here)',
  '',
  '---',
  '',
];

// Build versioned entry
const versioned = [
  `## [${version}] - ${today}`,
  ...unrelContent.filter(l => l.trim()),
  '',
];

const before = lines.slice(0, unrelStart);
const after  = nextVerLine === -1 ? [] : lines.slice(nextVerLine);

const updated = [
  ...before,
  ...freshUnreleased,
  ...versioned,
  ...after,
].join('\n');

// Update the comparison links at the bottom of CHANGELOG.md
const withLinks = updated
  .replace(
    /\[Unreleased\]: https:\/\/github\.com\/.*HEAD/,
    `[Unreleased]: https://github.com/mdarifuzzaman1116/propflow-app/compare/v${version}...HEAD`
  );

// Add the new version link if not already present
const versionLink = `[${version}]: https://github.com/mdarifuzzaman1116/propflow-app/releases/tag/v${version}`;
const finalContent = withLinks.includes(`[${version}]:`)
  ? withLinks
  : withLinks.trimEnd() + '\n' + versionLink + '\n';

fs.writeFileSync(changelogPath, finalContent, 'utf8');
console.log(`CHANGELOG.md updated with v${version} entry.`);
