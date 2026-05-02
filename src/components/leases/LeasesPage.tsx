"use client";
import { useState } from "react";
import { FileText, Plus, CheckCircle2, Clock, AlertTriangle, Download, PenLine, LucideIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";

type LeaseStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PENDING_SIGNATURE" | "DRAFT";

interface Lease {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  signed: boolean;
  daysUntilExpiry?: number;
}

const INITIAL_LEASES: Lease[] = [
  {
    id: "L-001", tenant: "Jake Tenant", property: "406 Oak St", unit: "2A",
    startDate: "2025-06-01", endDate: "2026-05-31", monthlyRent: 1900, securityDeposit: 3800,
    status: "EXPIRING_SOON", signed: true, daysUntilExpiry: 29,
  },
  {
    id: "L-002", tenant: "Sarah Chen", property: "880 Airport Blvd", unit: "1B",
    startDate: "2025-09-01", endDate: "2026-08-31", monthlyRent: 2200, securityDeposit: 4400,
    status: "ACTIVE", signed: true, daysUntilExpiry: 121,
  },
  {
    id: "L-003", tenant: "Marcus Johnson", property: "33 Orchard Plaza", unit: "3C",
    startDate: "2026-06-01", endDate: "2027-05-31", monthlyRent: 1750, securityDeposit: 3500,
    status: "PENDING_SIGNATURE", signed: false,
  },
  {
    id: "L-004", tenant: "Anna Kowalski", property: "406 Oak St", unit: "1C",
    startDate: "2024-04-01", endDate: "2025-03-31", monthlyRent: 1600, securityDeposit: 3200,
    status: "EXPIRED", signed: true, daysUntilExpiry: -62,
  },
];

const STATUS_CONFIG: Record<LeaseStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  ACTIVE:             { label: "Active",             color: "var(--success)", bg: "rgba(22,163,74,0.1)",  icon: CheckCircle2 },
  EXPIRING_SOON:      { label: "Expiring Soon",      color: "#ca8a04",        bg: "rgba(234,179,8,0.1)",  icon: Clock },
  EXPIRED:            { label: "Expired",            color: "var(--danger)",  bg: "rgba(239,68,68,0.1)", icon: AlertTriangle },
  PENDING_SIGNATURE:  { label: "Pending Signature",  color: "var(--primary)", bg: "rgba(79,110,247,0.1)", icon: PenLine },
  DRAFT:              { label: "Draft",              color: "var(--muted)",   bg: "var(--surface-2)",    icon: FileText },
};

export function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>(INITIAL_LEASES);
  const [activeFilter, setActiveFilter] = useState<LeaseStatus | "ALL">("ALL");
  const [expandedLease, setExpandedLease] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function sendRenewal(id: string) {
    setLeases((prev) =>
      prev.map((l) => l.id === id ? { ...l, status: "PENDING_SIGNATURE" as LeaseStatus } : l)
    );
    showToast("Renewal sent ✓");
  }

  function eSignLease(id: string) {
    const today = new Date().toISOString().split("T")[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const newEnd = nextYear.toISOString().split("T")[0];
    setLeases((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: "ACTIVE" as LeaseStatus, signed: true, startDate: today, endDate: newEnd }
          : l
      )
    );
    showToast("Lease signed — now Active ✓");
  }

  function toggleExpanded(id: string) {
    setExpandedLease((prev) => (prev === id ? null : id));
  }

  const filtered = activeFilter === "ALL" ? leases : leases.filter((l) => l.status === activeFilter);

  const total = leases.length;
  const active = leases.filter((l) => l.status === "ACTIVE").length;
  const expiring = leases.filter((l) => l.status === "EXPIRING_SOON").length;
  const pending = leases.filter((l) => l.status === "PENDING_SIGNATURE").length;

  return (
    <div data-testid="leases-page" className="space-y-5 pb-24 md:pb-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: "var(--success)", color: "#fff" }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex items-start justify-between pt-1">
        <div className="min-w-0 overflow-hidden">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Leases
          </h1>
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--muted)" }}>
            eSign · state-specific templates · auto-renewal reminders
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="create-lease-btn">
          <Plus size={15} /> New Lease
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Leases",        value: total,    color: "var(--body)" },
          { label: "Active",              value: active,   color: "var(--success)" },
          { label: "Expiring ≤30 days",   value: expiring, color: "#ca8a04" },
          { label: "Pending Signature",   value: pending,  color: "var(--primary)" },
        ].map((s) => (
          <Card key={s.label} testId={`lease-stat-${s.label}`}>
            <p className="text-xs truncate" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(["ALL", "ACTIVE", "EXPIRING_SOON", "PENDING_SIGNATURE", "EXPIRED"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={
              activeFilter === f
                ? { background: "var(--primary)", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--muted)" }
            }
          >
            {f === "ALL" ? "All" : STATUS_CONFIG[f as LeaseStatus]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Leases list */}
      <div className="space-y-3">
        {filtered.map((lease) => {
          const cfg = STATUS_CONFIG[lease.status];
          const StatusIcon = cfg.icon;
          const isExpanded = expandedLease === lease.id;
          return (
            <Card key={lease.id} testId={`lease-row-${lease.id}`} className="overflow-hidden">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <StatusIcon size={16} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{lease.tenant}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{lease.property} · {lease.unit}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    <span>Start: {lease.startDate}</span>
                    <span>End: {lease.endDate}</span>
                    <span>Rent: <strong style={{ color: "var(--body)" }}>${lease.monthlyRent.toLocaleString()}/mo</strong></span>
                    <span>Deposit: ${lease.securityDeposit.toLocaleString()}</span>
                  </div>

                  {lease.daysUntilExpiry !== undefined && lease.daysUntilExpiry > 0 && (
                    <p className="text-xs mt-1.5 font-medium" style={{ color: "#ca8a04" }}>
                      ⚠ Expires in {lease.daysUntilExpiry} days — send renewal notice
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded lease details */}
              {isExpanded && (
                <div
                  className="mt-3 p-3 rounded-xl space-y-2 text-xs"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--heading)" }}>Lease Details</p>
                  <div className="grid grid-cols-2 gap-2" style={{ color: "var(--muted)" }}>
                    <span>Tenant: <strong style={{ color: "var(--body)" }}>{lease.tenant}</strong></span>
                    <span>Unit: <strong style={{ color: "var(--body)" }}>{lease.unit}</strong></span>
                    <span>Start: <strong style={{ color: "var(--body)" }}>{lease.startDate}</strong></span>
                    <span>End: <strong style={{ color: "var(--body)" }}>{lease.endDate}</strong></span>
                    <span>Monthly Rent: <strong style={{ color: "var(--body)" }}>${lease.monthlyRent.toLocaleString()}</strong></span>
                    <span>Security Deposit: <strong style={{ color: "var(--body)" }}>${lease.securityDeposit.toLocaleString()}</strong></span>
                    <span>Status: <strong style={{ color: cfg.color }}>{cfg.label}</strong></span>
                    <span>Signed: <strong style={{ color: "var(--body)" }}>{lease.signed ? "Yes" : "No"}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedLease(null)}
                    className="text-xs mt-1 font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Close details ↑
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => toggleExpanded(lease.id)}
                  className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex items-center gap-1"
                >
                  {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  View Lease
                </button>
                <button type="button" className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex items-center gap-1.5">
                  <Download size={12} /> Download PDF
                </button>
                {!lease.signed && (
                  <button
                    type="button"
                    onClick={() => eSignLease(lease.id)}
                    className="pf-btn pf-btn-primary text-xs whitespace-nowrap flex items-center gap-1.5"
                  >
                    <PenLine size={12} /> eSign
                  </button>
                )}
                {lease.status === "EXPIRING_SOON" && (
                  <button
                    type="button"
                    onClick={() => sendRenewal(lease.id)}
                    className="pf-btn pf-btn-primary text-xs whitespace-nowrap"
                  >
                    Send Renewal
                  </button>
                )}
                {lease.status === "EXPIRED" && (
                  <button
                    type="button"
                    onClick={() => sendRenewal(lease.id)}
                    className="pf-btn pf-btn-primary text-xs whitespace-nowrap"
                    style={{ background: "var(--danger)" }}
                  >
                    Send Notice
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Template library teaser */}
      <Card testId="lease-templates">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-muted)" }}>
            <FileText size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>State-specific lease templates</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              New York, New Jersey, California + 48 more — auto-populate tenant &amp; property details
            </p>
          </div>
          <button type="button" className="pf-btn pf-btn-secondary text-xs flex-shrink-0">Browse</button>
        </div>
      </Card>
    </div>
  );
}
