"use client";
import { useState } from "react";
import { Plus, ChevronDown, CheckCircle, Clock, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Urgency = "Routine" | "Urgent";
type Category = "Plumbing" | "HVAC" | "Electrical" | "Other";
type RequestStatus = "Submitted" | "Pending" | "In Progress" | "Resolved";

interface MaintenanceRequest {
  id: string;
  title: string;
  category: Category;
  urgency: Urgency;
  status: RequestStatus;
  date: string;
}

const INITIAL_OPEN: MaintenanceRequest[] = [
  {
    id: "mr-001",
    title: "Kitchen faucet dripping",
    category: "Plumbing",
    urgency: "Routine",
    status: "In Progress",
    date: "Apr 22, 2026",
  },
];

const CLOSED_REQUESTS: MaintenanceRequest[] = [
  {
    id: "mr-000",
    title: "Broken door lock",
    category: "Other",
    urgency: "Urgent",
    status: "Resolved",
    date: "Feb 14, 2026",
  },
];

const CATEGORIES: Category[] = ["Plumbing", "HVAC", "Electrical", "Other"];
const URGENCIES: Urgency[] = ["Routine", "Urgent"];

const STATUS_STYLE: Record<RequestStatus, { bg: string; color: string }> = {
  Submitted:   { bg: "var(--primary-muted)",  color: "var(--primary)" },
  Pending:     { bg: "var(--warning-muted)",  color: "var(--warning)" },
  "In Progress": { bg: "var(--warning-muted)", color: "var(--warning)" },
  Resolved:    { bg: "var(--success-muted)",  color: "var(--success)" },
};

export function TenantMaintenancePage() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("Plumbing");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Routine");
  const [submitting, setSubmitting] = useState(false);
  const [openRequests, setOpenRequests] = useState<MaintenanceRequest[]>(INITIAL_OPEN);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);

    const newReq: MaintenanceRequest = {
      id: `mr-${Date.now()}`,
      title: description.trim(),
      category,
      urgency,
      status: "Submitted",
      date: "May 2, 2026",
    };

    setOpenRequests((prev) => [newReq, ...prev]);
    setOpen(false);
    setDescription("");
    setCategory("Plumbing");
    setUrgency("Routine");
    setSubmitting(false);

    // Transition status Submitted → Pending after 3s
    setTimeout(() => {
      setOpenRequests((prev) =>
        prev.map((r) => (r.id === newReq.id ? { ...r, status: "Pending" } : r)),
      );
    }, 3000);
  }

  return (
    <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-heading">Maintenance</h1>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="pf-btn pf-btn-primary text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0"
        >
          {open ? <X size={15} /> : <Plus size={15} />}
          {open ? "Cancel" : "New Request"}
        </button>
      </div>

      {/* Inline new-request form */}
      {open && (
        <Card>
          <p className="text-sm font-semibold text-heading mb-3">Submit a Request</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted" htmlFor="mr-category">
                Category
              </label>
              <div className="relative">
                <select
                  id="mr-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full appearance-none rounded-lg border text-sm text-body px-3 pr-8 h-10 bg-surface-2 border-border focus:outline-none"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border)",
                    color: "var(--body)",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--muted)" }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted" htmlFor="mr-desc">
                Description
              </label>
              <textarea
                id="mr-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue…"
                rows={3}
                required
                className="w-full rounded-lg border text-sm px-3 py-2 resize-none focus:outline-none"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--body)",
                }}
              />
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted">Urgency</p>
              <div className="flex flex-wrap gap-2">
                {URGENCIES.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    className="pf-btn text-sm flex-shrink-0"
                    style={{
                      background:
                        urgency === u ? "var(--primary)" : "var(--surface-2)",
                      color: urgency === u ? "white" : "var(--body)",
                      border: `1px solid ${urgency === u ? "var(--primary)" : "var(--border)"}`,
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="pf-btn pf-btn-primary text-sm w-full justify-center"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        </Card>
      )}

      {/* Open requests */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Open Requests ({openRequests.length})
        </p>
        {openRequests.length === 0 ? (
          <p className="text-sm text-muted py-2">No open requests.</p>
        ) : (
          <div className="space-y-3">
            {openRequests.map((req, i) => (
              <div
                key={req.id}
                className="flex items-start justify-between gap-3 py-3"
                style={{
                  borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                }}
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-heading truncate">
                    {req.title}
                  </p>
                  <p className="text-xs text-muted">
                    {req.category} · {req.urgency} · {req.date}
                  </p>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{
                    background: STATUS_STYLE[req.status].bg,
                    color: STATUS_STYLE[req.status].color,
                  }}
                >
                  <Clock size={11} />
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Closed requests */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Closed Requests
        </p>
        <div className="space-y-3">
          {CLOSED_REQUESTS.map((req, i) => (
            <div
              key={req.id}
              className="flex items-start justify-between gap-3 py-3"
              style={{
                borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-medium text-heading truncate">{req.title}</p>
                <p className="text-xs text-muted">
                  {req.category} · {req.urgency} · {req.date}
                </p>
              </div>
              <span
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                style={{
                  background: STATUS_STYLE[req.status].bg,
                  color: STATUS_STYLE[req.status].color,
                }}
              >
                <CheckCircle size={11} />
                {req.status} ✓
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
