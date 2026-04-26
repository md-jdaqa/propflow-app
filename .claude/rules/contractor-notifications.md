# Contractor Notification Rules
# Load when working on maintenance, vendors, or work order features.

## Routing Priority (category beats property)
Category-level assignment overrides property-level primary contractor.
No category assignment → use property primary contractor.
No property assignment → landlord alert fires immediately, never silent-fail.

## Dispatch Timing (from submission save)
EMERGENCY: 60 seconds max. Landlord also notified simultaneously.
URGENT: 5 minutes. ROUTINE: 30 minutes. LOW: 2 hours.

## Email Must Contain
Subject: [EMERGENCY/NEW] Maintenance Request — [Address] Unit [N] — [Category] — [MR-ID]
Body: summary table (ID, date, property, unit, tenant name+last-initial, urgency, category),
  full verbatim tenant description, first 4 photo thumbnails linked to signed URLs,
  Accept button (green), Decline button, landlord contact info, footer with request ID.
Signed media URLs expire after 7 days. Landlord can regenerate from work order page.
Videos: shown as thumbnail with play icon — never raw video tag in email.

## Accept/Decline Flow (no PropFlow account required)
Accept → status = 'accepted', landlord notified with contractor name + estimated date,
  tenant notified with estimated date (no contractor name by default),
  Inngest follow-up job cancelled.
Decline → status = 'declined', landlord gets immediate reassign notification
  with one-tap vendor picker. Original notification logged in work order timeline.
No response → Inngest job fires follow-up at: Routine 24h, Urgent 4h, Emergency 2h.

## Self-Healing For This Module
If contractor email bounces → Resend webhook marks vendor.emailStatus = 'invalid',
  landlord notification fires to update contact info.
If duplicate request detected (same category + unit + 7 days) →
  show warning before submission, offer "Add note to existing" vs "New request".

## Invoice Variance
Actual cost > estimated × 1.2 → show approval/dispute prompt.
Approved → auto-tags to Repairs & Maintenance, Schedule E Line 14.
