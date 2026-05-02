"use client";
import { useState } from "react";
import { Building2, FileText, Download, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface OwnerStatement {
  month: string;
  grossIncome: number;
  expenses: number;
  managementFee: number;
  netDistribution: number;
  status: "PAID" | "PENDING" | "DRAFT";
}

interface RepairApproval {
  id: string;
  property: string;
  description: string;
  contractor: string;
  estimate: number;
  urgency: "EMERGENCY" | "ROUTINE";
  requestedDate: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "DECLINED";
}

const OWNER_STATEMENTS: OwnerStatement[] = [
  { month: "April 2026", grossIncome: 5750, expenses: 1068.40, managementFee: 575, netDistribution: 4106.60, status: "PAID" },
  { month: "March 2026", grossIncome: 5750, expenses: 420, managementFee: 575, netDistribution: 4755, status: "PAID" },
  { month: "February 2026", grossIncome: 5750, expenses: 650, managementFee: 575, netDistribution: 4525, status: "PAID" },
  { month: "May 2026", grossIncome: 5750, expenses: 890, managementFee: 575, netDistribution: 4285, status: "PENDING" },
];

const REPAIR_APPROVALS: RepairApproval[] = [
  {
    id: "RA-001", property: "33 Orchard Plaza", description: "Lock cylinder replacement — Unit 1A",
    contractor: "Marcus Plumbing & Hardware", estimate: 890, urgency: "ROUTINE",
    requestedDate: "2026-05-01", status: "PENDING_APPROVAL",
  },
  {
    id: "RA-002", property: "880 Airport Blvd", description: "HVAC filter + boiler annual inspection",
    contractor: "City HVAC Services", estimate: 340, urgency: "ROUTINE",
    requestedDate: "2026-04-28", status: "APPROVED",
  },
];

const STATUS_CFG = {
  PAID:    { label: "Paid",    color: "var(--success)", bg: "rgba(22,163,74,0.1)" },
  PENDING: { label: "Pending", color: "#ca8a04",        bg: "rgba(234,179,8,0.1)" },
  DRAFT:   { label: "Draft",   color: "var(--muted)",   bg: "var(--surface-2)" },
};

const REPAIR_STATUS_CFG = {
  PENDING_APPROVAL: { label: "Awaiting Approval", color: "#ca8a04", icon: Clock },
  APPROVED:         { label: "Approved",           color: "var(--success)", icon: CheckCircle2 },
  DECLINED:         { label: "Declined",           color: "var(--danger)", icon: AlertTriangle },
};

export function OwnerPortalPage() {
  const [activeTab, setActiveTab] = useState<"STATEMENTS" | "APPROVALS" | "PORTFOLIO">("PORTFOLIO");
  const [approvals, setApprovals] = useState(REPAIR_APPROVALS);

  function handleApproval(id: string, action: "APPROVED" | "DECLINED") {
    setApprovals((prev) => prev.map((r) => r.id === id ? { ...r, status: action } : r));
  }

  const ytdIncome = OWNER_STATEMENTS.filter(s => s.status === "PAID").reduce((s, m) => s + m.grossIncome, 0);
  const ytdDistributions = OWNER_STATEMENTS.filter(s => s.status === "PAID").reduce((s, m) => s + m.netDistribution, 0);
  const pendingApprovals = approvals.filter(r => r.status === "PENDING_APPROVAL").length;

  return (
    <div data-testid="owner-portal-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Owner Portal
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Statements · repair approvals · portfolio overview
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-secondary text-sm flex items-center gap-1.5">
          <Download size={14} /> Export All
        </button>
      </header>

      {/* KPI stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card testId="owner-stat-income">
          <p className="text-xs" style={{ color: "var(--muted)" }}>YTD Gross Income</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--success)" }}>
            ${ytdIncome.toLocaleString()}
          </p>
        </Card>
        <Card testId="owner-stat-distributions">
          <p className="text-xs" style={{ color: "var(--muted)" }}>YTD Distributions</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--primary)" }}>
            ${ytdDistributions.toLocaleString()}
          </p>
        </Card>
        <Card testId="owner-stat-properties">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Properties</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--body)" }}>3</p>
        </Card>
        <Card testId="owner-stat-approvals">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Pending Approvals</p>
          <p className="text-2xl font-bold mt-1" style={{ color: pendingApprovals > 0 ? "#ca8a04" : "var(--success)" }}>
            {pendingApprovals}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5">
        {(["PORTFOLIO", "STATEMENTS", "APPROVALS"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={activeTab === tab ? { background: "var(--primary)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--muted)" }}
          >
            {tab === "PORTFOLIO" ? "Portfolio" : tab === "STATEMENTS" ? "Statements" : `Approvals${pendingApprovals > 0 ? ` (${pendingApprovals})` : ""}`}
          </button>
        ))}
      </div>

      {/* Portfolio view */}
      {activeTab === "PORTFOLIO" && (
        <div className="space-y-3">
          {[
            { address: "406 Oak St, Brooklyn NY", units: 3, occupancy: "2/3 Occupied", monthlyIncome: 3650, value: "$680,000" },
            { address: "880 Airport Blvd, Brooklyn NY", units: 2, occupancy: "2/2 Occupied", monthlyIncome: 4200, value: "$520,000" },
            { address: "33 Orchard Plaza, Brooklyn NY", units: 4, occupancy: "3/4 Occupied", monthlyIncome: 5100, value: "$890,000" },
          ].map((prop, i) => (
            <Card key={i} testId={`owner-property-${i}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(79,110,247,0.1)" }}>
                  <Building2 size={18} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{prop.address}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{prop.units} units · {prop.occupancy}</p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>Monthly Income</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--success)" }}>${prop.monthlyIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>Est. Value</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--body)" }}>{prop.value}</p>
                    </div>
                    <div>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>Mgmt Fee (10%)</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>${(prop.monthlyIncome * 0.1).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Statements view */}
      {activeTab === "STATEMENTS" && (
        <div className="space-y-3">
          {OWNER_STATEMENTS.map((stmt, i) => {
            const cfg = STATUS_CFG[stmt.status];
            return (
              <Card key={i} testId={`owner-statement-${i}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{stmt.month}</p>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: "var(--success)" }}>
                      ${stmt.netDistribution.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--muted)" }}>net distribution</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t text-xs" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <p style={{ color: "var(--muted)" }}>Gross Income</p>
                    <p className="font-semibold mt-0.5" style={{ color: "var(--body)" }}>${stmt.grossIncome.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--muted)" }}>Expenses</p>
                    <p className="font-semibold mt-0.5" style={{ color: "var(--danger)" }}>-${stmt.expenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--muted)" }}>Mgmt Fee</p>
                    <p className="font-semibold mt-0.5" style={{ color: "var(--muted)" }}>-${stmt.managementFee.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button type="button" className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5">
                    <FileText size={11} /> View PDF
                  </button>
                  <button type="button" className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5">
                    <Download size={11} /> Download
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approvals view */}
      {activeTab === "APPROVALS" && (
        <div className="space-y-3">
          {approvals.map((req) => {
            const cfg = REPAIR_STATUS_CFG[req.status];
            const Icon = cfg.icon;
            return (
              <Card key={req.id} testId={`repair-approval-${req.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>{req.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{req.property} · {req.contractor}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0" style={{ color: cfg.color }}>
                    <Icon size={12} />
                    <span className="text-[10px] font-semibold">{cfg.label}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Estimate</p>
                    <p className="font-bold" style={{ color: "var(--body)" }}>${req.estimate.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>Urgency</p>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{
                      background: req.urgency === "EMERGENCY" ? "rgba(239,68,68,0.1)" : "rgba(234,179,8,0.1)",
                      color: req.urgency === "EMERGENCY" ? "var(--danger)" : "#ca8a04",
                    }}>
                      {req.urgency}
                    </span>
                  </div>
                </div>
                {req.status === "PENDING_APPROVAL" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => handleApproval(req.id, "APPROVED")}
                      className="pf-btn pf-btn-primary text-xs flex-1"
                    >
                      ✓ Approve ${req.estimate.toLocaleString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproval(req.id, "DECLINED")}
                      className="pf-btn pf-btn-secondary text-xs"
                      style={{ color: "var(--danger)" }}
                    >
                      Decline
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
