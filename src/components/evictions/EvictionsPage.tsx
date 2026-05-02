"use client";
import { useState } from "react";
import { AlertTriangle, Plus, Scale, FileCheck, Phone, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";

type EvictionStatus = "NOTICE_SENT" | "FILING_PENDING" | "COURT_SCHEDULED" | "MEDIATION" | "RESOLVED" | "VACATED";

interface EvictionCase {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  reason: string;
  status: EvictionStatus;
  balanceDue: number;
  noticeSentDate?: string;
  courtDate?: string;
  attorney?: string;
  mediator?: string;
  notes: string;
}

const INITIAL_CASES: EvictionCase[] = [
  {
    id: "EV-001", tenant: "Robert Davis", property: "406 Oak St", unit: "3B",
    reason: "Non-payment of rent — 3 months overdue",
    status: "COURT_SCHEDULED", balanceDue: 5700,
    noticeSentDate: "2026-04-01", courtDate: "2026-05-15",
    attorney: "Stein & Associates", notes: "Tenant has not responded to notices.",
  },
  {
    id: "EV-002", tenant: "Linda Park", property: "880 Airport Blvd", unit: "4A",
    reason: "Lease violation — unauthorized pet",
    status: "MEDIATION", balanceDue: 0,
    noticeSentDate: "2026-04-20", mediator: "NY Mediation Center",
    notes: "Tenant agreed to mediation. Session scheduled May 10.",
  },
  {
    id: "EV-003", tenant: "Tom Wright", property: "33 Orchard Plaza", unit: "1A",
    reason: "Non-payment of rent — 2 months overdue",
    status: "NOTICE_SENT", balanceDue: 3500,
    noticeSentDate: "2026-04-28",
    notes: "Pay or quit notice delivered via certified mail.",
  },
];

const STATUS_CONFIG: Record<EvictionStatus, { label: string; color: string; bg: string }> = {
  NOTICE_SENT:      { label: "Notice Sent",       color: "#ca8a04",          bg: "rgba(234,179,8,0.1)" },
  FILING_PENDING:   { label: "Filing Pending",     color: "var(--primary)",   bg: "rgba(79,110,247,0.1)" },
  COURT_SCHEDULED:  { label: "Court Scheduled",    color: "var(--danger)",    bg: "rgba(239,68,68,0.1)" },
  MEDIATION:        { label: "Mediation",          color: "var(--secondary)", bg: "rgba(14,165,160,0.1)" },
  RESOLVED:         { label: "Resolved",           color: "var(--success)",   bg: "rgba(22,163,74,0.1)" },
  VACATED:          { label: "Vacated",            color: "var(--muted)",     bg: "var(--surface-2)" },
};

const NEXT_STATUS: Partial<Record<EvictionStatus, EvictionStatus>> = {
  NOTICE_SENT:     "FILING_PENDING",
  FILING_PENDING:  "COURT_SCHEDULED",
  COURT_SCHEDULED: "RESOLVED",
  MEDIATION:       "RESOLVED",
};

const TIMELINE_STEPS = [
  { key: "NOTICE_SENT",     label: "Notice Sent" },
  { key: "FILING_PENDING",  label: "Response Period" },
  { key: "COURT_SCHEDULED", label: "Court Filing" },
  { key: "RESOLVED",        label: "Hearing / Resolution" },
];

const STATUS_ORDER: EvictionStatus[] = ["NOTICE_SENT", "FILING_PENDING", "COURT_SCHEDULED", "RESOLVED"];

function getStepIndex(status: EvictionStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? (status === "MEDIATION" ? 1 : STATUS_ORDER.length) : idx;
}

export function EvictionsPage() {
  const [cases, setCases] = useState<EvictionCase[]>(INITIAL_CASES);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<Record<string, string>>({});
  const [downloadMsg, setDownloadMsg] = useState<Record<string, string>>({});

  const totalDue = cases.reduce((sum, c) => sum + c.balanceDue, 0);
  const active = cases.filter((c) => !["RESOLVED", "VACATED"].includes(c.status)).length;

  function advanceStatus(id: string, currentStatus: EvictionStatus) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: next } : c)));
    setActionMsg((prev) => ({ ...prev, [id]: "Action recorded ✓" }));
    setTimeout(() => setActionMsg((prev) => ({ ...prev, [id]: "" })), 3000);
  }

  function triggerDownload(id: string) {
    setDownloadMsg((prev) => ({ ...prev, [id]: "PDF download coming soon ✓" }));
    setTimeout(() => setDownloadMsg((prev) => ({ ...prev, [id]: "" })), 3000);
  }

  return (
    <div data-testid="evictions-page" className="space-y-5 pb-24 md:pb-6">
      {/* Header */}
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Evictions
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Case management · mediators · process servers · 93% court avoidance rate
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="add-eviction-btn">
          <Plus size={15} /> New Case
        </button>
      </header>

      {/* Protection banner */}
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(79,110,247,0.08) 0%, rgba(14,165,160,0.05) 100%)",
          border: "1.5px solid rgba(79,110,247,0.2)",
        }}
      >
        <Shield size={20} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>Eviction Protection Add-on</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Access professional mediators and process servers. 93% of cases resolved without going to court.
            Network covers all 50 states.
          </p>
          <button type="button" className="pf-btn pf-btn-primary text-xs mt-2">Connect with Mediator</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card testId="eviction-stat-active">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Active Cases</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--danger)" }}>{active}</p>
        </Card>
        <Card testId="eviction-stat-due">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Total Balance Due</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--body)" }}>${totalDue.toLocaleString()}</p>
        </Card>
        <Card testId="eviction-stat-total">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Total Cases</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--body)" }}>{cases.length}</p>
        </Card>
      </div>

      {/* Cases */}
      <div className="space-y-3">
        {cases.map((ec) => {
          const cfg = STATUS_CONFIG[ec.status];
          const isExpanded = expandedCase === ec.id;
          const currentStepIdx = getStepIndex(ec.status);
          const hasNextStep = !!NEXT_STATUS[ec.status];

          return (
            <Card key={ec.id} testId={`eviction-row-${ec.id}`}>
              {/* Card header — click to expand/collapse */}
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedCase(isExpanded ? null : ec.id)}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}
                >
                  <AlertTriangle size={15} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{ec.tenant}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{ec.property} · {ec.unit}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {isExpanded
                        ? <ChevronUp size={14} style={{ color: "var(--muted)" }} />
                        : <ChevronDown size={14} style={{ color: "var(--muted)" }} />
                      }
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{ec.reason}</p>
                  {ec.balanceDue > 0 && (
                    <p className="text-xs font-semibold mt-1" style={{ color: "var(--danger)" }}>
                      Balance due: ${ec.balanceDue.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded timeline */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                  {/* Timeline steps */}
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--heading)" }}>Case Timeline</p>
                    <div className="flex items-center gap-0">
                      {TIMELINE_STEPS.map((step, idx) => {
                        const isComplete = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center" style={{ minWidth: 0, flex: 1 }}>
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                                style={{
                                  background: isComplete
                                    ? "var(--success)"
                                    : isCurrent
                                    ? cfg.color
                                    : "var(--surface-2)",
                                  color: isComplete || isCurrent ? "#fff" : "var(--muted)",
                                  border: isCurrent ? `2px solid ${cfg.color}` : "none",
                                }}
                              >
                                {isComplete ? "✓" : idx + 1}
                              </div>
                              <p
                                className="text-[9px] mt-1 text-center leading-tight"
                                style={{
                                  color: isCurrent ? cfg.color : isComplete ? "var(--success)" : "var(--muted)",
                                  fontWeight: isCurrent ? 700 : 400,
                                }}
                              >
                                {step.label}
                              </p>
                            </div>
                            {idx < TIMELINE_STEPS.length - 1 && (
                              <div
                                className="h-0.5 flex-shrink-0"
                                style={{
                                  width: 24,
                                  background: idx < currentStepIdx ? "var(--success)" : "var(--border)",
                                  marginBottom: 16,
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Case details */}
                  <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--muted)" }}>
                    {ec.noticeSentDate && <span>Notice sent: {ec.noticeSentDate}</span>}
                    {ec.courtDate && <span style={{ color: "var(--danger)", fontWeight: 600 }}>Court date: {ec.courtDate}</span>}
                    {ec.attorney && <span>Attorney: {ec.attorney}</span>}
                    {ec.mediator && <span style={{ color: "var(--secondary)" }}>Mediator: {ec.mediator}</span>}
                  </div>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{ec.notes}</p>

                  {/* Feedback messages */}
                  {actionMsg[ec.id] && (
                    <p className="text-xs font-semibold" style={{ color: "var(--success)" }}>{actionMsg[ec.id]}</p>
                  )}
                  {downloadMsg[ec.id] && (
                    <p className="text-xs font-semibold" style={{ color: "var(--success)" }}>{downloadMsg[ec.id]}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5"
                      onClick={() => triggerDownload(ec.id)}
                    >
                      <FileCheck size={12} /> Download Notice
                    </button>
                    {hasNextStep && (
                      <button
                        type="button"
                        className="pf-btn pf-btn-primary text-xs flex items-center gap-1.5"
                        onClick={() => advanceStatus(ec.id, ec.status)}
                      >
                        <Scale size={12} /> File with Court
                      </button>
                    )}
                    <button type="button" className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5">
                      <Phone size={12} /> Contact Tenant
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs ml-auto"
                      onClick={() => setExpandedCase(null)}
                    >
                      Collapse ↑
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
