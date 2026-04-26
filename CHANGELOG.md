# Changelog — PropFlow
# Format: Keep a Changelog (keepachangelog.com)
# Versioning: Semantic Versioning (semver.org)
# Managed by scripts/version-bump.sh — never manually edit versioned sections.
# Add changes to [Unreleased] as you build them. version-bump.sh moves them.

## [Unreleased]
### Added
- Phase 0 scaffold: Next.js 14 App Router + TypeScript + Tailwind + ESLint
- Phase 0 deps: Supabase (auth-helpers + ssr), Prisma 5 (Postgres), Stripe, Playwright, Inngest, Resend, Twilio, archiver, zod
- Prisma schema with User, UserSettings, Property, Unit, Tenant, Payment, Receipt, TransactionRule (8 models, 6 enums)
- AES-256-GCM encryption helper for sensitive fields (API keys, ntfy tokens)
- Supabase browser + server clients + middleware-aware session refresh helper
- Phase 1 Playwright config: Desktop Chrome + Mobile iPhone 14 + Tablet iPad Pro projects
- Phase 1 footer version badge with click-to-open changelog modal (reads /api/changelog)
- Phase 1 20 @smoke tests covering nav, dashboard, modals, finances tabs, settings, sign-in, OAuth buttons, no-overflow check
- Phase 2 root layout with default dark theme + OS auto-detect bootstrap
- Phase 2 10 selectable themes (Midnight Pro, Arctic Glass, Warm Amber, Emerald Trust, Slate Pro, Soft Cream, Purple Depth, Steel Industrial, Sunset Gradient, High Contrast) persisted to localStorage
- Phase 2 navigation chrome: top nav, mobile bottom nav (5 links), desktop left sidebar
- Phase 2 dashboard with 7 cards: Rent Collected, Outstanding, Occupancy, Recent Payments, Uncategorized, Upcoming, Tax Readiness
- Phase 2 Modal + SlideOver + Tabs + Card primitives (mobile = bottom sheet)
- Phase 2 Record Payment modal: Income/Expense toggle, live tax-badge preview, full Zod validation
- Phase 2 Add Property slide-over: 3-section form (Basic, Address, Notes) with field-level errors
- Phase 2 Finances page with 4 tabs: Overview (CSS bar chart), Transactions (12-row mock + filters), Rules (with embedded RuleForm), Reports (4 report cards)
- Phase 2 Settings page: theme picker + AI BYOAI section (OpenAI/Anthropic, masked keys, test connection) + ntfy section (test push) + account + danger zone
- Phase 3 Auth pages: email + Google + Apple + Microsoft (Azure) via Supabase, sign-in + sign-up + /auth/callback exchange
- Phase 3 Tenants page + tenant detail + Add Tenant modal + tenants CRUD API
- Phase 3 Properties page + property detail + Add Property + Unit form + properties/units CRUD API
- Phase 3 Cash Receipt generator: auto-numbered (PF-YYYY-NNNNNN), printable HTML with amount-in-words, draft fallback when DB offline
- Phase 3 Partial-payment consolidation engine with deterministic SHA-1-derived group ids
- Phase 3 Schedule E auto-categorization (lines 3, 5–19) + tax badges (DEDUCTIBLE/INCOME/NON_DEDUCTIBLE/REVIEW/UNCATEGORIZED) + CPA + 1099-NEC warnings
- Phase 3 Transaction Rules engine + CRUD API (priority-sorted, first match wins, Joseph Neff case covered)
- Phase 3 One-click Tax Package ZIP: schedule-e.csv, transactions.csv, properties.csv, README, all receipts as HTML; demo-mode fallback
- Phase 3 Payments API with full pipeline: rules → categorize → persist → optionally generate receipt
- Middleware: graceful fail-open when Supabase env unset, otherwise enforces session on protected routes

### Fixed
- App shell layout: switched sidebar offset from `md:ml-60` to `md:pl-60` on a wrapper div so `max-w-7xl mx-auto` doesn't collide with the left margin (was causing horizontal overflow at desktop viewport)

### Changed
- (initial build — no behavior changes from prior versions)

---

## [0.0.1] - 2026-04-28
### Added
- Project initialized: Next.js 14, TypeScript, Tailwind, Supabase, Prisma
- Playwright: Desktop Chrome, Mobile iPhone 14, Tablet iPad Pro configs
- Gate Rule testing protocol with TESTING.md append-only log
- CLAUDE.md with all standing rules including critical pain-point prevention
- PROMPTS.md prompt and decision log with UserPromptSubmit hook
- SESSION.md session handover with PreCompact/PostCompact auto-save/restore
- notify.sh ntfy push notification via Tailscale IP
- version-bump.sh automated release pipeline with full regression gate
- update-changelog.js automated CHANGELOG.md entry management
- log-results.js Playwright result parser writing to TESTING.md
- log-prompt.js prompt logger with auto-classifier (BUG/UI/FEATURE/etc)
- pre-compact.sh saves transcript + writes SESSION.md before compaction
- post-compact.sh re-injects SESSION.md into fresh context after compaction
- .claude/settings.json: 7 hooks wired (SessionStart, UserPromptSubmit,
  PreCompact, PostCompact, Stop, Notification, SessionEnd)
- Linear free tier integration script for auto issue creation
- Scoped rules files: themes.md, tax-categories.md, contractor-notifications.md
- Footer version badge reading from src/lib/version.ts
- Changelog modal reading from CHANGELOG.md

---

[Unreleased]: https://github.com/mdarifuzzaman1116/propflow-app/compare/v0.0.1...HEAD
[0.0.1]: https://github.com/mdarifuzzaman1116/propflow-app/releases/tag/v0.0.1
