"use client";
import { useState } from "react";
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle2, Search, ChevronDown, ChevronUp, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Priority = "EMERGENCY" | "URGENT" | "ROUTINE" | "LOW";
type Status = "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  property: string;
  unit: string;
  tenant: string;
  priority: Priority;
  status: Status;
  category: string;
  createdAt: string;
  coordinator?: string;
  contractor?: string;
}

const INITIAL_REQUESTS: MaintenanceRequest[] = [
  {
    id: "MR-001", title: "Leaking kitchen faucet", description: "Kitchen faucet dripping constantly since yesterday.",
    property: "406 Oak St", unit: "2A", tenant: "Jake Tenant", priority: "ROUTINE", status: "OPEN",
    category: "Plumbing", createdAt: "2026-05-01", coordinator: "Emma Rodriguez",
  },
  {
    id: "MR-002", title: "No heat in bedroom", description: "Radiator stopped working. Temperature dropping.",
    property: "880 Airport Blvd", unit: "1B", tenant: "Sarah Chen", priority: "URGENT", status: "IN_PROGRESS",
    category: "HVAC", createdAt: "2026-04-30", coordinator: "Mike Torres",
  },
  {
    id: "MR-003", title: "Broken front door lock", description: "Lock cylinder is jammed. Cannot fully lock.",
    property: "33 Orchard Plaza", unit: "3C", tenant: "Marcus Johnson", priority: "EMERGENCY", status: "OPEN",
    category: "Security", createdAt: "2026-05-02",
  },
  {
    id: "MR-004", title: "Bathroom ceiling water stain", description: "Small water stain appeared after heavy rain.",
    property: "406 Oak St", unit: "1C", tenant: "Anna Kowalski", priority: "LOW", status: "WAITING",
    category: "Structural", createdAt: "2026-04-28",
  },
];

const CONTRACTORS = ["Marcus Plumbing", "City HVAC", "Pro Electric"];

const PRIORITY_COLORS: Record<Priority, { bg: string; color: string; label: string }> = {
  EMERGENCY: { bg: "rgba(239,68,68,0.12)", color: "var(--danger)", label: "Emergency" },
  URGENT:    { bg: "rgba(234,179,8,0.12)",  color: "#ca8a04",        label: "Urgent" },
  ROUTINE:   { bg: "rgba(79,110,247,0.12)", color: "var(--primary)", label: "Routine" },
  LOW:       { bg: "var(--surface-2)",       color: "var(--muted)",   label: "Low" },
};

const STATUS_ICONS: Record<Status, LucideIcon> = {
  OPEN:        Clock,
  IN_PROGRESS: Wrench,
  WAITING:     AlertTriangle,
  RESOLVED:    CheckCircle2,
};

export function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState<"ALL" | Priority | Status>("ALL");
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contractorPickerIds, setContractorPickerIds] = useState<Set<string>>(new Set());

  const filtered = requests.filter((r) => {
    if (search && !`${r.title} ${r.property} ${r.tenant}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "ALL") return true;
    return r.priority === filter || r.status === filter;
  });

  const counts = {
    open: requests.filter((r) => r.status === "OPEN").length,
    emergency: requests.filter((r) => r.priority === "EMERGENCY").length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    resolved: requests.filter((r) => r.status === "RESOLVED").length,
  };

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleContractorPicker(id: string) {
    setContractorPickerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function assignContractor(id: string, name: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, contractor: name } : r));
    setContractorPickerIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function markResolved(id: string) {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "RESOLVED" } : r));
  }

  return (
    <div data-testid="maintenance-page" className="space-y-5 pb-24 md:pb-6">
      {/* Header */}
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Maintenance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            24/7 repair coordination · {requests.length} active requests
          </p>
        </div>
        <button
          type="button"
          className="pf-btn pf-btn-primary text-sm"
          data-testid="add-maintenance-btn"
        >
          <Plus size={15} /> New Request
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Open", value: counts.open, color: "var(--primary)" },
          { label: "Emergency", value: counts.emergency, color: "var(--danger)" },
          { label: "In Progress", value: counts.inProgress, color: "#ca8a04" },
          { label: "Resolved", value: counts.resolved, color: "var(--success)" },
        ].map((s) => (
          <Card key={s.label} testId={`maintenance-stat-${s.label.toLowerCase().replace(" ", "-")}`}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pf-input pl-9 text-sm w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["ALL", "EMERGENCY", "URGENT", "ROUTINE", "LOW"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={
                filter === f
                  ? { background: "var(--primary)", color: "#fff" }
                  : { background: "var(--surface-2)", color: "var(--muted)" }
              }
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card testId="maintenance-empty">
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>
              No maintenance requests found.
            </p>
          </Card>
        ) : (
          filtered.map((req) => {
            const pri = PRIORITY_COLORS[req.priority];
            const StatusIcon = STATUS_ICONS[req.status];
            const isExpanded = expandedIds.has(req.id);
            const showContractorPicker = contractorPickerIds.has(req.id);
            const isResolved = req.status === "RESOLVED";
            return (
              <div
                key={req.id}
                style={{ opacity: isResolved ? 0.5 : 1, transition: "opacity 0.3s" }}
              >
                <Card testId={`maintenance-row-${req.id}`}>
                  <div className="flex items-start gap-3">
                    {/* Priority badge */}
                    <span
                      className="flex-shrink-0 mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{ background: pri.bg, color: pri.color }}
                    >
                      {pri.label}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                          {req.title}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0" style={{ color: "var(--muted)" }}>
                          <StatusIcon size={13} />
                          <span className="text-xs">{req.status.replace("_", " ")}</span>
                        </div>
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                        {req.description}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: "var(--muted)" }}>
                        <span>{req.property} · {req.unit}</span>
                        <span>{req.tenant}</span>
                        <span>{req.category}</span>
                        {req.coordinator && (
                          <span style={{ color: "var(--secondary)" }}>Coordinator: {req.coordinator}</span>
                        )}
                        {req.contractor && (
                          <span className="flex items-center gap-1.5">
                            <span style={{ color: "var(--success)" }}>Contractor: {req.contractor}</span>
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(22,163,74,0.12)", color: "var(--success)" }}
                              data-testid={`contractor-portal-badge-${req.id}`}
                            >
                              In contractor portal ✓
                            </span>
                          </span>
                        )}
                        <span>{req.createdAt}</span>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div
                          className="mt-3 p-3 rounded-lg text-xs space-y-1.5"
                          style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                        >
                          <p><strong style={{ color: "var(--body)" }}>Full description:</strong> {req.description}</p>
                          <p><strong style={{ color: "var(--body)" }}>Request ID:</strong> {req.id}</p>
                          <p><strong style={{ color: "var(--body)" }}>Submitted:</strong> {req.createdAt}</p>
                          <p><strong style={{ color: "var(--body)" }}>Photos:</strong> 0 attached</p>
                          <p><strong style={{ color: "var(--body)" }}>Notes:</strong> No notes yet.</p>
                        </div>
                      )}

                      {/* Contractor picker */}
                      {showContractorPicker && (
                        <div
                          className="mt-3 p-3 rounded-lg space-y-1.5"
                          style={{ background: "var(--surface-2)" }}
                        >
                          <p className="text-xs font-semibold mb-2" style={{ color: "var(--body)" }}>Select contractor:</p>
                          {CONTRACTORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => assignContractor(req.id, c)}
                              className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
                              style={{ background: "var(--card)", color: "var(--body)" }}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions — wrapping row on mobile */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex-shrink-0 flex items-center gap-1"
                      onClick={() => toggleExpanded(req.id)}
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      View Details
                    </button>
                    <button
                      type="button"
                      className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex-shrink-0"
                      onClick={() => toggleContractorPicker(req.id)}
                    >
                      Assign Contractor
                    </button>
                    {!isResolved && (
                      <button
                        type="button"
                        className="pf-btn pf-btn-primary text-xs whitespace-nowrap flex-shrink-0"
                        onClick={() => markResolved(req.id)}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
