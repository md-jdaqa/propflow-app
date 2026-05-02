"use client";
import { useState } from "react";
import { ClipboardCheck, Plus, Camera, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

type InspectionType = "MOVE_IN" | "MOVE_OUT" | "PERIODIC" | "DRIVE_BY";
type InspectionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_ATTENTION";

interface ChecklistItem {
  area: string;
  items: string[];
}

interface Inspection {
  id: string;
  type: InspectionType;
  property: string;
  unit: string;
  tenant: string;
  scheduledDate: string;
  status: InspectionStatus;
  inspector?: string;
  photoCount: number;
  notes?: string;
  score?: number;
}

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: "INS-001", type: "MOVE_IN", property: "406 Oak St", unit: "2A",
    tenant: "Carlos Rivera", scheduledDate: "2026-06-01", status: "SCHEDULED",
    inspector: "Arif", photoCount: 0,
  },
  {
    id: "INS-002", type: "MOVE_OUT", property: "406 Oak St", unit: "3B",
    tenant: "Robert Davis (former)", scheduledDate: "2026-05-15", status: "COMPLETED",
    inspector: "Arif", photoCount: 24, notes: "Minor scuff on bedroom wall. Carpet clean.", score: 87,
  },
  {
    id: "INS-003", type: "PERIODIC", property: "880 Airport Blvd", unit: "1B",
    tenant: "Sarah Chen", scheduledDate: "2026-05-10", status: "NEEDS_ATTENTION",
    inspector: "Arif", photoCount: 18, notes: "HVAC filter needs replacement. Small crack in bathroom tile.", score: 72,
  },
];

const MOVE_IN_CHECKLIST: ChecklistItem[] = [
  { area: "Kitchen", items: ["Appliances working", "Cabinet doors & drawers", "Sink & faucet", "Countertops clean"] },
  { area: "Bathroom", items: ["Toilet functional", "Shower/tub condition", "Caulk & grout", "Ventilation fan"] },
  { area: "Bedroom(s)", items: ["Walls & paint", "Flooring", "Windows & locks", "Closet doors"] },
  { area: "Living Areas", items: ["Walls & ceiling", "Flooring", "Light fixtures", "Outlets & switches"] },
  { area: "Entry/Exterior", items: ["Front door lock", "Mailbox key", "Parking", "Common areas"] },
];

const TYPE_CFG: Record<InspectionType, { label: string; color: string; bg: string }> = {
  MOVE_IN:   { label: "Move-In",  color: "var(--success)",  bg: "rgba(22,163,74,0.1)" },
  MOVE_OUT:  { label: "Move-Out", color: "var(--danger)",   bg: "rgba(239,68,68,0.1)" },
  PERIODIC:  { label: "Periodic", color: "var(--primary)",  bg: "rgba(79,110,247,0.1)" },
  DRIVE_BY:  { label: "Drive-By", color: "#ca8a04",         bg: "rgba(234,179,8,0.1)" },
};

const STATUS_CFG: Record<InspectionStatus, { label: string; color: string; icon: typeof Clock }> = {
  SCHEDULED:        { label: "Scheduled",       color: "var(--primary)", icon: Clock },
  IN_PROGRESS:      { label: "In Progress",     color: "#ca8a04",        icon: ClipboardCheck },
  COMPLETED:        { label: "Completed",       color: "var(--success)", icon: CheckCircle2 },
  NEEDS_ATTENTION:  { label: "Needs Attention", color: "var(--danger)",  icon: AlertTriangle },
};

export function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>(INITIAL_INSPECTIONS);
  const [showChecklist, setShowChecklist] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const [templateApplied, setTemplateApplied] = useState(false);

  function startInspection(id: string) {
    setInspections((prev) =>
      prev.map((i) => i.id === id ? { ...i, status: "IN_PROGRESS" as InspectionStatus } : i)
    );
  }

  function toggleReport(id: string) {
    setExpandedReport((prev) => (prev === id ? null : id));
  }

  function showAddPhotos(id: string) {
    setPhotoMsg(id);
    setTimeout(() => setPhotoMsg(null), 3000);
  }

  function applyTemplate() {
    setTemplateApplied(true);
    setTimeout(() => setTemplateApplied(false), 3000);
  }

  return (
    <div data-testid="inspections-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Inspections
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Move-in · Move-out · Periodic · photo documentation
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm" data-testid="schedule-inspection-btn">
          <Plus size={15} /> Schedule
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card testId="inspection-stat-scheduled">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Scheduled</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--primary)" }}>
            {inspections.filter((i) => i.status === "SCHEDULED").length}
          </p>
        </Card>
        <Card testId="inspection-stat-attention">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Needs Attention</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--danger)" }}>
            {inspections.filter((i) => i.status === "NEEDS_ATTENTION").length}
          </p>
        </Card>
        <Card testId="inspection-stat-completed">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Completed (30d)</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--success)" }}>
            {inspections.filter((i) => i.status === "COMPLETED").length}
          </p>
        </Card>
      </div>

      {/* Inspections */}
      <div className="space-y-3">
        {inspections.map((ins) => {
          const typeCfg = TYPE_CFG[ins.type];
          const statusCfg = STATUS_CFG[ins.status];
          const StatusIcon = statusCfg.icon;
          const isReportOpen = expandedReport === ins.id;
          const isPhotoMsgVisible = photoMsg === ins.id;
          return (
            <Card key={ins.id} testId={`inspection-row-${ins.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: typeCfg.bg }}
                >
                  <ClipboardCheck size={16} style={{ color: typeCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
                        {typeCfg.label} — {ins.property} {ins.unit}
                      </p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{ins.tenant}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0" style={{ color: statusCfg.color }}>
                      <StatusIcon size={12} />
                      <span className="text-[10px] font-semibold">{statusCfg.label}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <span>Date: {ins.scheduledDate}</span>
                    {ins.inspector && <span>Inspector: {ins.inspector}</span>}
                    {ins.photoCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Camera size={10} /> {ins.photoCount} photos
                      </span>
                    )}
                    {ins.score !== undefined && (
                      <span
                        className="font-semibold"
                        style={{ color: ins.score >= 80 ? "var(--success)" : ins.score >= 60 ? "#ca8a04" : "var(--danger)" }}
                      >
                        Score: {ins.score}/100
                      </span>
                    )}
                  </div>
                  {ins.notes && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{ins.notes}</p>}
                </div>
              </div>

              {/* Expanded report view */}
              {isReportOpen && (
                <div
                  className="mt-3 p-3 rounded-xl space-y-2 text-xs"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "var(--heading)" }}>Inspection Report</p>
                  {ins.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--muted)" }}>Overall Score:</span>
                      <span
                        className="font-bold text-sm"
                        style={{ color: ins.score >= 80 ? "var(--success)" : ins.score >= 60 ? "#ca8a04" : "var(--danger)" }}
                      >
                        {ins.score}/100
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2" style={{ color: "var(--muted)" }}>
                    <span>Type: <strong style={{ color: "var(--body)" }}>{typeCfg.label}</strong></span>
                    <span>Status: <strong style={{ color: statusCfg.color }}>{statusCfg.label}</strong></span>
                    <span>Date: <strong style={{ color: "var(--body)" }}>{ins.scheduledDate}</strong></span>
                    <span>Photos: <strong style={{ color: "var(--body)" }}>{ins.photoCount}</strong></span>
                  </div>
                  {ins.notes && (
                    <div>
                      <p style={{ color: "var(--muted)" }}>Notes:</p>
                      <p className="mt-0.5" style={{ color: "var(--body)" }}>{ins.notes}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedReport(null)}
                    className="text-xs mt-1 font-medium"
                    style={{ color: "var(--muted)" }}
                  >
                    Close report ↑
                  </button>
                </div>
              )}

              {/* Photo upload message */}
              {isPhotoMsgVisible && (
                <p
                  className="text-xs mt-2 px-3 py-2 rounded-lg"
                  style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  📷 Photo upload coming soon
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  onClick={() => toggleReport(ins.id)}
                  className="pf-btn pf-btn-secondary text-xs whitespace-nowrap"
                >
                  {isReportOpen ? "Hide Report" : "View Report"}
                </button>
                <button
                  type="button"
                  onClick={() => showAddPhotos(ins.id)}
                  className="pf-btn pf-btn-secondary text-xs whitespace-nowrap flex items-center gap-1.5"
                >
                  <Camera size={11} /> Add Photos
                </button>
                {ins.status === "SCHEDULED" && (
                  <button
                    type="button"
                    onClick={() => startInspection(ins.id)}
                    className="pf-btn pf-btn-primary text-xs whitespace-nowrap"
                  >
                    Start Inspection
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Checklist template */}
      <Card testId="inspection-checklist">
        <button
          type="button"
          onClick={() => setShowChecklist((s) => !s)}
          className="w-full flex items-center justify-between text-left"
        >
          <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>
            Standard Move-In/Out Checklist Template
          </p>
          <span className="text-xs" style={{ color: "var(--primary)" }}>
            {showChecklist ? "Collapse" : "View"}
          </span>
        </button>
        {showChecklist && (
          <div className="mt-3 space-y-3">
            {MOVE_IN_CHECKLIST.map((section) => (
              <div key={section.area}>
                <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--heading)" }}>{section.area}</p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />
                      <span style={{ color: "var(--body)" }}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={applyTemplate}
              className="pf-btn pf-btn-primary text-xs w-full mt-2"
            >
              {templateApplied ? "Template applied ✓" : "Use This Template"}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
