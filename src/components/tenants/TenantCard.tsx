import Link from "next/link";
import type { TenantListItem } from "@/app/(app)/tenants/page";

interface Props {
  tenant: TenantListItem;
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function badgeFor(days: number | null) {
  if (days === null) return null;
  let cls = "bg-success/15 text-success";
  let text = `${days} days left`;
  if (days < 0) {
    cls = "bg-danger/15 text-danger";
    text = "Lease ended";
  } else if (days <= 30) {
    cls = "bg-danger/15 text-danger";
  } else if (days <= 60) {
    cls = "bg-warning/15 text-warning";
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{text}</span>
  );
}

export function TenantCard({ tenant }: Props) {
  const days = daysUntil(tenant.leaseEnd);

  return (
    <div
      data-testid={`tenant-card-${tenant.id}`}
      className="pf-card flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="shrink-0 w-11 h-11 rounded-full bg-primary/15 text-primary grid place-items-center text-sm font-semibold"
        >
          {initials(tenant.firstName, tenant.lastName)}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/tenants/${tenant.id}`}
            className="text-base font-semibold text-heading hover:text-primary"
          >
            {tenant.firstName} {tenant.lastName}
          </Link>
          <p className="text-xs text-muted truncate">
            {tenant.unitLabel ?? "No unit"}
            {tenant.propertyName ? ` · ${tenant.propertyName}` : ""}
          </p>
          <p className="text-xs text-muted">
            {fmtDate(tenant.leaseStart)} → {fmtDate(tenant.leaseEnd)}
          </p>
        </div>
        {badgeFor(days)}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-body">
          {tenant.monthlyRent
            ? `$${tenant.monthlyRent.toLocaleString()}/mo`
            : "Rent not set"}
        </span>
        <Link
          href={`/finances?tab=record&tenant=${tenant.id}`}
          data-testid={`tenant-record-payment-${tenant.id}`}
          className="pf-btn pf-btn-primary min-h-9 h-9 px-3 text-sm"
        >
          Record payment
        </Link>
      </div>
    </div>
  );
}
