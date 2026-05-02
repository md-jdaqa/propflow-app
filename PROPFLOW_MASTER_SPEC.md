# PropFlow — Master Product Specification
# Innago + Stessa Combined, Plus What Neither Offers
# Last updated: May 2026

---

## 1. The Vision

PropFlow is the property management platform that Innago and Stessa would be if they merged — and then went further. Innago owns the operations layer (tenants, leases, maintenance, screening). Stessa owns the financial layer (bookkeeping, tax prep, banking, performance). Neither owns both at once, and neither offers a first-class **tenant-facing experience** or an **AI-powered workflow**. PropFlow does all three.

**Target users:** Independent landlords with 1–50 units, small property management companies.
**Owner stack:** Brooklyn, NY residential portfolio (Eldert St, Saratoga Ave, Hancock St).

---

## 2. The Three Roles

Every user in PropFlow belongs to exactly one role. All three share the same database. Permissions are enforced at the API layer via Row Level Security (Supabase RLS) and a `role` field on the `User` model.

### Role 1: Landlord (Owner)
The property owner. Full read/write access to everything under their portfolio. Creates properties, invites property managers, adds tenants. Sees all financials, all maintenance, all communications.

Key things only Landlords can do:
- Create and delete properties
- Invite or remove property managers
- Access Schedule E tax package and all financial reports
- Set rent amounts and lease terms
- View the full portfolio P&L dashboard
- Approve or override any action from a property manager
- Set property manager permission scopes

### Role 2: Property Manager
Operates under a Landlord's account. Scoped to properties the Landlord assigns to them. Can do everything day-to-day that the Landlord can do within their assigned properties, except delete properties or access the full financial/tax layer unless the Landlord explicitly grants it.

Key things Property Managers can do:
- Add and edit tenants within assigned properties
- Record and track rent payments
- Handle maintenance requests end to end (assign vendors, mark resolved)
- Send messages to tenants
- Generate and send receipts
- View financial reports for their assigned properties only
- Conduct tenant screening (results go to Landlord for final approval)
- Upload and manage lease documents

### Role 3: Tenant
Lives in one of the Landlord's units. Sees only their own data. Cannot see other tenants, other units, or any financial data belonging to the landlord. Has their own mobile-first portal.

Key things Tenants can do:
- Pay rent online (ACH, card, Zelle-style, autopay)
- View their full payment history and download receipts
- View and sign their lease
- Submit maintenance requests with photo/video attachments
- Track the status of their open maintenance requests
- Send and receive messages with the landlord/property manager
- View lease details (end date, monthly rent, move-in date)
- Upload documents (renter's insurance, IDs)
- Opt in to rent payment credit reporting
- Receive push/email notifications for important events

---

## 3. Feature Matrix — Innago vs. Stessa vs. PropFlow

### A. Tenant Management

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Online tenant application | ✅ | ✅ | ✅ |
| Tenant screening (credit, criminal, eviction) | ✅ ($30–35/report) | ✅ (paid add-on) | ✅ (free for landlord, pass cost to applicant optionally) |
| Electronic lease signing | ✅ | ✅ | ✅ + AI lease drafting |
| Lease storage and versioning | ✅ | ✅ | ✅ + diff viewer |
| Tenant portal (web) | ✅ | ❌ | ✅ |
| Tenant portal (mobile app) | ✅ | ❌ | ✅ (mobile-first PWA) |
| Tenant-side rent payment history | ✅ | ❌ | ✅ |
| Tenant credit reporting (on-time payments) | ✅ | ❌ | ✅ |
| Renter's insurance tracking | ✅ | ❌ | ✅ + expiry alerts |
| Lease renewal workflow | ✅ | ❌ | ✅ + automated reminders at 90/60/30 days |
| Move-in / move-out checklist | ✅ | ❌ | ✅ + photo documentation |
| Co-signer support | ❌ | ❌ | ✅ |
| Guarantor support | ❌ | ❌ | ✅ |

### B. Rent Collection

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Online rent collection (ACH) | ✅ | ✅ | ✅ |
| Card payments | ✅ (fee passed to tenant) | ✅ | ✅ |
| Autopay / recurring payments | ✅ | ✅ | ✅ |
| Late fee automation | ✅ | ✅ | ✅ + grace period config |
| Partial payments | ✅ | ❌ | ✅ + partial payment ledger |
| Cash / Zelle / Venmo manual recording | ❌ | ❌ | ✅ (AI receipt scan + auto-fill) |
| Printed receipts (PDF) | ❌ | ❌ | ✅ |
| Tenant-facing payment receipt | ❌ | ❌ | ✅ |
| AI receipt scanner (upload screenshot → auto-fill) | ❌ | ❌ | ✅ |
| Rent split (roommates) | ❌ | ❌ | ✅ |
| Security deposit management | ✅ | ❌ | ✅ + state escrow rules |
| Payment reminders (email/SMS) | ✅ | ✅ | ✅ + push notification |

### C. Maintenance

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Tenant-submitted requests | ✅ | Basic | ✅ |
| Photo/video upload on requests | ✅ | ❌ | ✅ |
| Urgency levels (emergency / routine) | ✅ | ❌ | ✅ |
| Landlord notification on new request | ✅ | ❌ | ✅ (push + ntfy) |
| Vendor/contractor assignment | ✅ | ❌ | ✅ + contractor directory |
| Work order tracking (open/assigned/resolved) | ✅ | ❌ | ✅ |
| Contractor email dispatch | ✅ | ❌ | ✅ + accept/decline link |
| Recurring maintenance tasks | ✅ | ❌ | ✅ (e.g. HVAC filter every 90 days) |
| Maintenance cost tracking | ❌ | ✅ | ✅ + Schedule E auto-tagging |
| Damage reports | ✅ | ❌ | ✅ + photo evidence log |
| Warranty tracking per appliance | ❌ | ❌ | ✅ |
| AI priority suggestion (by urgency keywords) | ❌ | ❌ | ✅ |
| Tenant satisfaction rating post-resolution | ❌ | ❌ | ✅ |

### D. Financial Management

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Income & expense tracking | Basic | ✅ | ✅ |
| Bank account sync | ❌ | ✅ | ✅ |
| Automated transaction categorization | ❌ | ✅ | ✅ + custom rules engine |
| Schedule E tax mapping | ❌ | Partial | ✅ (full Line 3–19) |
| Tax package export (PDF/CSV) | ❌ | ✅ | ✅ |
| Receipt upload / scanning | ❌ | ✅ (mobile) | ✅ + AI extraction |
| Profit & loss per property | ❌ | ✅ | ✅ |
| Cash flow report | ❌ | ✅ | ✅ |
| Landlord banking (interest-bearing accounts) | ❌ | ✅ (2.31–3.98% APY) | Roadmap (Stripe Treasury) |
| Rent roll report | ✅ | Partial | ✅ |
| Tenant ledger | ✅ | ✅ | ✅ |
| Mortgage interest tracking | ❌ | ✅ | ✅ |
| Property valuation estimates | ❌ | ✅ | Roadmap |
| Multi-property portfolio P&L | ❌ | ✅ | ✅ |
| QuickBooks / Xero export | ❌ | ❌ | ✅ (roadmap) |

### E. Listing & Marketing

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Vacancy listing creation | ✅ | ❌ | ✅ |
| Syndication (Zillow, Trulia, etc.) | ✅ | ❌ | ✅ (roadmap) |
| Online application form | ✅ | ✅ | ✅ |
| Application fee collection | ✅ | ✅ | ✅ |
| Showing scheduler | ❌ | ❌ | ✅ (roadmap) |
| AI listing description generator | ❌ | ❌ | ✅ |

### F. Communication

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Landlord ↔ Tenant messaging | ✅ | ❌ | ✅ (in-app + email fallback) |
| Mass announcements to all tenants | ❌ | ❌ | ✅ |
| Lease renewal notices | ✅ | ❌ | ✅ + templated |
| Late payment reminders | ✅ | ✅ | ✅ |
| Maintenance status updates to tenant | ✅ | ❌ | ✅ (auto on status change) |
| Move-out notice workflow | ❌ | ❌ | ✅ |
| Push notifications (mobile) | ✅ | ❌ | ✅ |
| ntfy.sh self-hosted alerts (Arif's system) | ❌ | ❌ | ✅ |
| Email notifications | ✅ | ✅ | ✅ (Resend) |
| SMS notifications | ✅ (paid) | ❌ | ✅ (Twilio) |

### G. Reporting & Analytics

| Feature | Innago | Stessa | PropFlow |
|---|---|---|---|
| Rent collection summary | ✅ | ✅ | ✅ |
| Income statement | Basic | ✅ | ✅ |
| Expense breakdown by category | ❌ | ✅ | ✅ |
| Occupancy rate by property | ❌ | Partial | ✅ |
| Maintenance cost analysis | ❌ | ❌ | ✅ |
| Tenant payment history report | ✅ | ✅ | ✅ |
| Year-over-year comparison | ❌ | ✅ | ✅ |
| Tax-ready Schedule E export | ❌ | ✅ | ✅ |
| Portfolio-level dashboard | ❌ | ✅ | ✅ |
| Per-property dashboard | ✅ | ✅ | ✅ |

---

## 4. What PropFlow Uniquely Offers (Neither Innago Nor Stessa Has This)

These are our competitive advantages — features that neither platform offers as of 2026:

1. **AI Receipt Scanner** — Upload any payment screenshot (Zelle, Venmo, CashApp, bank transfer). AI reads it, auto-fills amount, date, method, payer, and matches to the right tenant. Attaches proof to the PDF receipt.

2. **AI Lease Assistant** — Generate a lease draft from property details using AI. Plain-language summaries of every clause for tenants. Red-flag detection on uploaded third-party leases.

3. **Three-Role Architecture** — Landlord, Property Manager, and Tenant in one app with scoped permissions. Neither Innago nor Stessa has a proper property manager role with customizable scopes.

4. **Tenant Credit Reporting without a fee** — Innago charges and passes cost. PropFlow includes it.

5. **ntfy.sh Push Alerts** — Self-hosted, privacy-first notifications for landlords who don't want to depend on third-party push services.

6. **Maintenance → Expense Auto-Link** — When a work order is resolved with a cost, it automatically creates a Schedule E Line 14 expense entry. No double-entry.

7. **Appliance & Warranty Tracker** — Track appliances per unit with purchase date, warranty expiry, and maintenance history. Auto-creates a maintenance task when warranty is about to expire.

8. **Rent Split for Roommates** — Assign a unit to multiple tenants, split rent by percentage or fixed amount. Each tenant pays their share independently; the system reconciles into one rent event.

9. **Damage Report with Photo Evidence Chain** — Move-in and move-out photo logs with timestamped evidence, tied to the security deposit workflow.

10. **Offline-First Mobile** — Works without internet for viewing lease info, submitting maintenance requests (queued), and viewing payment history. Syncs when connection returns.

11. **Dark Mode, Mobile-First UI** — Both competitors have dated, desktop-first interfaces. PropFlow is built dark-mode first, 390px first.

12. **Property Manager Invitation Flow** — Landlord invites a property manager by email. PM gets a scoped login. Landlord can revoke, reassign, or adjust permissions at any time.

---

## 5. Database: Role-Based Architecture

### User Model Extension

```
User {
  id          UUID
  email       String (unique)
  role        Enum: LANDLORD | PROPERTY_MANAGER | TENANT
  createdAt   DateTime

  // LANDLORD fields
  ownedProperties    Property[]
  invitedManagers    PropertyManagerAssignment[]

  // PROPERTY_MANAGER fields
  managedAssignments PropertyManagerAssignment[]

  // TENANT fields
  tenantProfile      Tenant?     // links to existing Tenant model
}

PropertyManagerAssignment {
  id              UUID
  landlordId      UUID → User (LANDLORD)
  managerId       UUID → User (PROPERTY_MANAGER)
  propertyId      UUID → Property   // null = all properties
  canViewFinances Boolean @default(false)
  canScreenTenants Boolean @default(true)
  canManageMaintenance Boolean @default(true)
  inviteToken     String?
  inviteAccepted  Boolean @default(false)
  createdAt       DateTime
}
```

### Tenant Portal Auth
When a Landlord adds a tenant record (existing flow), PropFlow sends an invite email. Tenant clicks the link, sets a password, and gets a `TENANT` role user linked to their existing `Tenant` record. The relationship: `User.tenantProfile → Tenant.userId`.

### RLS Rules (Supabase)
- `LANDLORD`: full access to all rows where `ownerId = auth.uid()`
- `PROPERTY_MANAGER`: access to rows where a `PropertyManagerAssignment` links their `userId` to the `propertyId`
- `TENANT`: access only to their own `Tenant` row, their `Payment` rows, their `MaintenanceRequest` rows, and their `Lease` row

---

## 6. Tenant Portal Pages

These are the screens the Tenant role sees after logging in:

| Page | Content |
|---|---|
| **Home** | Next rent due (amount + date), quick Pay button, open maintenance count, unread messages |
| **Payments** | Full payment history, download any receipt as PDF, autopay toggle |
| **Maintenance** | Submit new request (photo/video + urgency), list of open + resolved requests with status |
| **Lease** | View current lease PDF, key dates (start, end, renewal window), sign/countersign |
| **Messages** | Chat thread with landlord/PM, message history |
| **Documents** | Upload and view: renter's insurance, IDs, move-in checklist |
| **Profile** | Contact info, notification preferences, credit reporting opt-in |

---

## 7. Property Manager Portal Pages

These are the screens the Property Manager role sees (scoped to their assigned properties):

| Page | Content |
|---|---|
| **Dashboard** | Rent collection status for assigned properties, open maintenance, expiring leases |
| **Tenants** | Add/edit tenants, view lease status, send messages, record payments |
| **Maintenance** | Manage work orders, assign vendors, update status, upload invoices |
| **Properties** | View (not create/delete) their assigned properties and units |
| **Payments** | Record manual payments, view payment history, generate receipts |
| **Reports** | Financial reports for assigned properties only (if finance access granted) |

---

## 8. Implementation Phases

### Phase A — Role & Auth Foundation (Next up)
- Add `role` field to User model
- Extend Prisma schema with `PropertyManagerAssignment`
- Update Supabase RLS policies for all three roles
- Update sign-up flow: default new users to LANDLORD
- Add tenant invite flow (email → set password → TENANT role)
- Add property manager invite flow

### Phase B — Tenant Portal
- Tenant dashboard (home, payments, maintenance)
- Tenant lease viewer
- Tenant maintenance submission (reuses existing backend)
- Tenant messaging thread

### Phase C — Property Manager Portal
- PM-scoped dashboard
- PM invite + accept flow
- Permission management UI for Landlords

### Phase D — Maintenance V2
- Vendor/contractor directory
- Work order assignment and dispatch email
- Maintenance → expense auto-link
- Recurring maintenance tasks

### Phase E — Lease & Application
- Online application form (public URL)
- Tenant screening integration
- Electronic lease signing
- Lease renewal workflow

### Phase F — Advanced Financials
- Bank account sync
- Property valuation estimates
- QuickBooks export
- Landlord banking (Stripe Treasury)

---

## 9. What We Tell Users We Are

> PropFlow replaces Innago and Stessa. You get Innago's tenant and operations workflow — screening, maintenance, lease signing, tenant communication — combined with Stessa's financial depth — bookkeeping, Schedule E, tax packages, portfolio P&L — in one dark-mode, mobile-first platform with an AI layer that neither competitor has. One login. Three roles. Everything connected.

---

*This document drives all future development decisions. When in doubt about scope, refer to the feature matrix in Section 3 and the phase plan in Section 8.*
