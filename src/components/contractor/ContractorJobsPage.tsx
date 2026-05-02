"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, StickyNote } from "lucide-react";

type JobStatus = "PENDING" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

interface Job {
  id: string;
  description: string;
  property: string;
  unit?: string;
  status: JobStatus;
  dueDate: string | null;
  estimatedAmount: number;
  notes: string[];
}

const INITIAL_JOBS: Job[] = [
  {
    id: "MR-001",
    description: "Kitchen faucet dripping",
    property: "406 Oak St",
    unit: "Unit 2A",
    status: "IN_PROGRESS",
    dueDate: "2026-05-10",
    estimatedAmount: 250,
    notes: [],
  },
  {
    id: "MR-002",
    description: "HVAC annual inspection",
    property: "880 Airport Blvd",
    unit: undefined,
    status: "SCHEDULED",
    dueDate: "2026-05-15",
    estimatedAmount: 340,
    notes: [],
  },
  {
    id: "MR-003",
    description: "Lock cylinder replacement",
    property: "33 Orchard Plaza",
    unit: "Unit 1A",
    status: "PENDING",
    dueDate: null,
    estimatedAmount: 890,
    notes: [],
  },
];

const STATUS_CONFIG: Record<JobStatus, { label: string; bg: string; color: string }> = {
  PENDING:     { label: "Pending",     bg: "rgba(245,158,11,0.12)",  color: "var(--warning)" },
  SCHEDULED:   { label: "Scheduled",   bg: "rgba(79,110,247,0.12)",  color: "var(--primary)" },
  IN_PROGRESS: { label: "In Progress", bg: "rgba(14,165,160,0.12)",  color: "var(--secondary)" },
  COMPLETED:   { label: "Completed",   bg: "rgba(34,197,94,0.12)",   color: "var(--success)" },
};

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "TBD";
  const [year, month, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
}

function JobCard({ job, onComplete, onAddNote }: {
  job: Job;
  onComplete: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showNoteBox, setShowNoteBox] = useState(false);
  const [noteText, setNoteText] = useState("");
  const isCompleted = job.status === "COMPLETED";

  function handleSaveNote() {
    if (!noteText.trim()) return;
    onAddNote(job.id, noteText.trim());
    setNoteText("");
    setShowNoteBox(false);
  }

  return (
    <div
      className="pf-card"
      style={{ opacity: isCompleted ? 0.6 : 1, transition: "opacity 300ms ease" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>{job.id}</span>
            <StatusBadge status={job.status} />
          </div>
          <p className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
            {job.description}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {job.property}{job.unit ? ` · ${job.unit}` : ""}
          </p>
        </div>
        <button
          aria-label={expanded ? "Collapse" : "Expand"}
          onClick={() => setExpanded((v) => !v)}
          className="pf-btn pf-btn-ghost w-9 h-9 min-w-0 min-h-0 p-0 flex-shrink-0"
          style={{ padding: 0, minWidth: "36px", minHeight: "36px" }}
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Always-visible summary */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          Due: <span style={{ color: "var(--body)" }}>{formatDate(job.dueDate)}</span>
        </span>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          Est: <span className="font-semibold" style={{ color: "var(--heading)" }}>
            ${job.estimatedAmount.toLocaleString()}
          </span>
        </span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          {/* Notes list */}
          {job.notes.length > 0 && (
            <div className="mb-3 space-y-1.5">
              {job.notes.map((note, i) => (
                <div
                  key={i}
                  className="text-xs p-2 rounded"
                  style={{ background: "var(--surface-2)", color: "var(--body)" }}
                >
                  <span style={{ color: "var(--muted)", marginRight: "0.5rem" }}>Note:</span>
                  {note}
                </div>
              ))}
            </div>
          )}

          {/* Add note textarea */}
          {showNoteBox && (
            <div className="mb-3">
              <textarea
                className="pf-input w-full resize-none"
                rows={3}
                placeholder="Add a note about this job..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                style={{ height: "auto", paddingTop: "0.625rem", paddingBottom: "0.625rem" }}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  className="pf-btn pf-btn-primary whitespace-nowrap flex-shrink-0"
                  onClick={handleSaveNote}
                  style={{ minHeight: "36px", height: "36px" }}
                >
                  Save Note
                </button>
                <button
                  className="pf-btn pf-btn-ghost whitespace-nowrap flex-shrink-0"
                  onClick={() => { setShowNoteBox(false); setNoteText(""); }}
                  style={{ minHeight: "36px", height: "36px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isCompleted && (
            <div className="flex flex-wrap gap-2">
              <button
                className="pf-btn pf-btn-success whitespace-nowrap flex-shrink-0"
                onClick={() => onComplete(job.id)}
                style={{ minHeight: "40px" }}
              >
                <CheckCircle2 size={15} />
                Mark Complete
              </button>
              {!showNoteBox && (
                <button
                  className="pf-btn pf-btn-secondary whitespace-nowrap flex-shrink-0"
                  onClick={() => setShowNoteBox(true)}
                  style={{ minHeight: "40px" }}
                >
                  <StickyNote size={15} />
                  Add Note
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ContractorJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

  function handleComplete(id: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, status: "COMPLETED" as JobStatus } : j))
    );
  }

  function handleAddNote(id: string, note: string) {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, notes: [note, ...j.notes] } : j))
    );
  }

  const active    = jobs.filter((j) => j.status === "IN_PROGRESS" || j.status === "SCHEDULED").length;
  const completed = jobs.filter((j) => j.status === "COMPLETED").length;
  const pending   = jobs.filter((j) => j.status === "PENDING").length;

  return (
    <div className="pb-24">
      <h1 className="text-xl font-bold mb-4" style={{ color: "var(--heading)" }}>My Jobs</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Active",               value: active,    color: "var(--secondary)" },
          { label: "Completed (mo.)",       value: completed, color: "var(--success)" },
          { label: "Pending Approval",      value: pending,   color: "var(--warning)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="pf-card text-center" style={{ padding: "0.75rem" }}>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onComplete={handleComplete}
            onAddNote={handleAddNote}
          />
        ))}
      </div>
    </div>
  );
}
