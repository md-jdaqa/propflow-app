"use client";
import { useState } from "react";
import { ClipboardList, Plus, CheckCircle2, XCircle, Clock, UserCheck, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type AppStatus = "PENDING" | "REVIEWING" | "APPROVED" | "DENIED" | "WITHDRAWN";

interface Application {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  desiredMoveIn: string;
  monthlyIncome: number;
  status: AppStatus;
  creditScore?: number;
  submittedAt: string;
  notes?: string;
}

const MOCK_APPS: Application[] = [
  {
    id: "APP-001", applicantName: "Carlos Rivera", email: "carlos@email.com", phone: "718-555-0101",
    property: "406 Oak St", unit: "2A", desiredMoveIn: "2026-06-01",
    monthlyIncome: 6500, status: "REVIEWING", creditScore: 720, submittedAt: "2026-04-28",
    notes: "References checked. Strong application.",
  },
  {
    id: "APP-002", applicantName: "Diana Lee", email: "diana@email.com", phone: "212-555-0202",
    property: "880 Airport Blvd", unit: "3C", desiredMoveIn: "2026-07-01",
    monthlyIncome: 5200, status: "PENDING", submittedAt: "2026-05-01",
  },
  {
    id: "APP-003", applicantName: "James Kumar", email: "james@email.com", phone: "646-555-0303",
    property: "33 Orchard Plaza", unit: "2B", desiredMoveIn: "2026-06-15",
    monthlyIncome: 4800, status: "APPROVED", creditScore: 680, submittedAt: "2026-04-15",
    notes: "Approved. Lease sent for signature.",
  },
];

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string; icon: LucideIcon }> = {
  PENDING:    { label: "Pending",    color: "var(--muted)",   bg: "var(--surface-2)",        icon: Clock },
  REVIEWING:  { label: "Reviewing", color: "#ca8a04",         bg: "rgba(234,179,8,0.1)",     icon: UserCheck },
  APPROVED:   { label: "Approved",  color: "var(--success)",  bg: "rgba(22,163,74,0.1)",     icon: CheckCircle2 },
  DENIED:     { label: "Denied",    color: "var(--danger)",   bg: "rgba(239,68,68,0.1)",     icon: XCircle },
  WITHDRAWN:  { label: "Withdrawn", color: "var(--muted)",    bg: "var(--surface-2)",        icon: XCircle },
};

export function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(MOCK_APPS);
  const [activeFilter, setActiveFilter] = useState<AppStatus | "ALL">("ALL");

  const filtered = activeFilter === "ALL" ? apps : apps.filter((a) => a.status === activeFilter);

  function updateStatus(id: string, status: AppStatus) {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  }

  return (
    <div data-testid="applications-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Applications
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Rental applications · credit checks · tenant screening
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="add-application-btn">
          <Plus size={15} /> New Application
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: apps.length, color: "var(--body)" },
          { label: "Reviewing", value: apps.filter((a) => a.status === "REVIEWING").length, color: "#ca8a04" },
          { label: "Approved",  value: apps.filter((a) => a.status === "APPROVED").length, color: "var(--success)" },
          { label: "Pending",   value: apps.filter((a) => a.status === "PENDING").length, color: "var(--primary)" },
        ].map((s) => (
          <Card key={s.label} testId={`app-stat-${s.label}`}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 overflow-x-auto flex-nowrap pb-1">
        {(["ALL", "PENDING", "REVIEWING", "APPROVED", "DENIED"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 whitespace-nowrap"
            style={
              activeFilter === f
                ? { background: "var(--primary)", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--muted)" }
            }
          >
            {f === "ALL" ? "All" : STATUS_CONFIG[f as AppStatus]?.label ?? f}
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="space-y-3">
        {filtered.map((app) => {
          const cfg = STATUS_CONFIG[app.status];
          const StatusIcon = cfg.icon;
          const incomeRatio = app.monthlyIncome; // would be compared to rent in real app
          return (
            <Card key={app.id} testId={`application-row-${app.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  {app.applicantName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{app.applicantName}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{app.email} · {app.phone}</p>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <StatusIcon size={9} />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    <span>{app.property} · {app.unit}</span>
                    <span>Move-in: {app.desiredMoveIn}</span>
                    <span>Income: <strong style={{ color: "var(--body)" }}>${app.monthlyIncome.toLocaleString()}/mo</strong></span>
                    {app.creditScore && <span>Credit: <strong style={{ color: app.creditScore >= 700 ? "var(--success)" : "#ca8a04" }}>{app.creditScore}</strong></span>}
                  </div>
                  {app.notes && <p className="text-xs mt-1.5" style={{ color: "var(--muted)" }}>{app.notes}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap" style={{ borderColor: "var(--border)" }}>
                <button type="button" className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex-shrink-0">View Full Application</button>
                <button type="button" className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex-shrink-0">Run Credit Check</button>
                {(app.status === "REVIEWING" || app.status === "PENDING") && (
                  <>
                    <button
                      type="button"
                      className="pf-btn pf-btn-primary text-xs whitespace-nowrap flex-shrink-0"
                      onClick={() => updateStatus(app.id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="pf-btn text-xs whitespace-nowrap flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}
                      onClick={() => updateStatus(app.id, "DENIED")}
                    >
                      Deny
                    </button>
                  </>
                )}
                {app.status === "APPROVED" && (
                  <button
                    type="button"
                    className="pf-btn pf-btn-primary text-xs whitespace-nowrap flex-shrink-0"
                    onClick={() => { window.location.href = "/leases"; }}
                  >
                    Create Lease
                  </button>
                )}
                {app.status === "DENIED" && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
                    Denied
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
