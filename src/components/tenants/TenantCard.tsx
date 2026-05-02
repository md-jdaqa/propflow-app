"use client";
import Link from "next/link";
import type { TenantListItem } from "@/app/(app)/tenants/page";
import { CreditCard, ChevronRight, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";

interface Props {
  tenant: TenantListItem;
  index?: number;
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Deterministic color from initials
const AVATAR_GRADIENTS = [
  ["#4F6EF7", "#818cf8"],
  ["#0EA5A0", "#34d399"],
  ["#8B5CF6", "#c084fc"],
  ["#F59E0B", "#fbbf24"],
  ["#EF4444", "#f87171"],
  ["#06B6D4", "#67e8f9"],
];
function avatarGradient(name: string): string[] {
  const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function LeaseBadge({ days }: { days: number | null }) {
  if (days === null) return null;

  if (days < 0) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full pf-badge-urgent"
        style={{ background: "var(--danger-muted)", color: "var(--danger)" }}
      >
        <AlertTriangle size={10} strokeWidth={2.5} />
        Lease ended
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full pf-badge-urgent"
        style={{ background: "rgba(239,68,68,0.12)", color: "var(--danger)" }}
      >
        <Clock size={10} strokeWidth={2.5} />
        {days}d left
      </span>
    );
  }
  if (days <= 60) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "var(--warning-muted)", color: "var(--warning)" }}
      >
        <Clock size={10} strokeWidth={2.5} />
        {days}d left
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: "var(--success-muted)", color: "var(--success)" }}
    >
      <CheckCircle2 size={10} strokeWidth={2.5} />
      {days} days left
    </span>
  );
}

export function TenantCard({ tenant, index = 0 }: Props) {
  const days = daysUntil(tenant.leaseEnd);
  const [c1, c2] = avatarGradient(tenant.firstName + tenant.lastName);

  return (
    <div
      data-testid={`tenant-card-${tenant.id}`}
      className="pf-card pf-card-interactive pf-animate-list-in group relative overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Subtle left accent bar based on lease urgency */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{
          background: days === null || days > 60
            ? "var(--primary)"
            : days <= 0
            ? "var(--danger)"
            : days <= 30
            ? "var(--danger)"
            : "var(--warning)",
          opacity: 0.7,
        }}
      />

      <div className="flex items-start gap-3 pl-3">
        {/* Avatar with gradient */}
        <div
          className="shrink-0 w-12 h-12 rounded-2xl grid place-items-center text-sm font-bold text-white shadow-sm flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
            boxShadow: `0 2px 8px ${c1}40`,
          }}
          aria-hidden
        >
          {initials(tenant.firstName, tenant.lastName)}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <Link
              href={`/tenants/${tenant.id}`}
              className="text-sm font-semibold hover:text-[var(--primary)] transition-colors flex items-center gap-1"
              style={{ color: "var(--heading)" }}
            >
              {tenant.firstName} {tenant.lastName}
              <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" style={{ color: "var(--primary)" }} />
            </Link>
            <LeaseBadge days={days} />
          </div>

          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
            {tenant.unitLabel ?? "No unit"}
            {tenant.propertyName ? ` · ${tenant.propertyName}` : ""}
          </p>

          {/* Lease dates */}
          <div className="flex items-center gap-1 mt-1">
            <Calendar size={10} style={{ color: "var(--muted)" }} />
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {fmtDate(tenant.leaseStart)} → {fmtDate(tenant.leaseEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div
        className="flex items-center justify-between gap-2 mt-4 pt-3 pl-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="min-w-0">
          <div className="text-xs" style={{ color: "var(--muted)" }}>Monthly rent</div>
          <div className="text-base font-bold" style={{ color: "var(--heading)" }}>
            {tenant.monthlyRent
              ? `$${tenant.monthlyRent.toLocaleString()}`
              : <span style={{ color: "var(--muted)" }}>Not set</span>
            }
            {tenant.monthlyRent && <span className="text-xs font-normal ml-0.5" style={{ color: "var(--muted)" }}>/mo</span>}
          </div>
        </div>

        <Link
          href={`/finances?tab=record&tenant=${tenant.id}`}
          data-testid={`tenant-record-payment-${tenant.id}`}
          className="pf-btn pf-btn-primary h-10 min-h-10 px-4 text-sm gap-2 flex-shrink-0"
        >
          <CreditCard size={14} />
          Record payment
        </Link>
      </div>
    </div>
  );
}
