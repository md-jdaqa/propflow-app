"use client";

import { Card } from "@/components/ui/Card";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type CheckStatus = "PENDING" | "CLEAR" | "FLAGS";

interface Applicant {
  id: string;
  name: string;
  email: string;
  property: string;
  unit: string;
  status: CheckStatus;
  creditScore: number | null;
  evictionHistory: "None Found" | "Record Found" | "Pending";
  criminalCheck: "Clear" | "Flag Found" | "Pending";
  incomeVerified: boolean | null;
  appliedDate: string;
}

const STATUS_CONFIG: Record<CheckStatus, { icon: React.ReactNode; bg: string; text: string; label: string }> = {
  PENDING: {
    icon: <Shield size={14} />,
    bg: "rgba(217,119,6,0.15)",
    text: "var(--warning)",
    label: "Pending",
  },
  CLEAR: {
    icon: <ShieldCheck size={14} />,
    bg: "var(--success-muted, rgba(22,163,74,0.15))",
    text: "var(--success)",
    label: "Clear",
  },
  FLAGS: {
    icon: <ShieldAlert size={14} />,
    bg: "var(--danger-muted, rgba(220,38,38,0.15))",
    text: "var(--danger)",
    label: "Flags Found",
  },
};

const MOCK_APPLICANTS: Applicant[] = [
  {
    id: "a1",
    name: "Daniela Reyes",
    email: "daniela.reyes@email.com",
    property: "880 Airport Blvd",
    unit: "Unit 2B",
    status: "CLEAR",
    creditScore: 742,
    evictionHistory: "None Found",
    criminalCheck: "Clear",
    incomeVerified: true,
    appliedDate: "Apr 25, 2026",
  },
  {
    id: "a2",
    name: "Trevor Mason",
    email: "trevor.mason@email.com",
    property: "880 Airport Blvd",
    unit: "Unit 1A",
    status: "FLAGS",
    creditScore: 588,
    evictionHistory: "Record Found",
    criminalCheck: "Clear",
    incomeVerified: false,
    appliedDate: "Apr 27, 2026",
  },
  {
    id: "a3",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    property: "123 Main St",
    unit: "Unit 3C",
    status: "PENDING",
    creditScore: null,
    evictionHistory: "Pending",
    criminalCheck: "Pending",
    incomeVerified: null,
    appliedDate: "Apr 30, 2026",
  },
];

function StatusBadge({ status }: { status: CheckStatus }) {
  const { icon, bg, text, label } = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: bg, color: text }}
    >
      {icon}
      {label}
    </span>
  );
}

function CheckRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
        {icon}
        {label}
      </div>
      <span className="text-xs font-semibold" style={{ color: valueColor ?? "var(--body)" }}>
        {value}
      </span>
    </div>
  );
}

function creditScoreColor(score: number): string {
  if (score >= 720) return "var(--success)";
  if (score >= 660) return "var(--warning)";
  return "var(--danger)";
}

export function BackgroundChecksPage() {
  const pending = MOCK_APPLICANTS.filter((a) => a.status === "PENDING").length;
  const clear   = MOCK_APPLICANTS.filter((a) => a.status === "CLEAR").length;
  const flagged = MOCK_APPLICANTS.filter((a) => a.status === "FLAGS").length;

  return (
    <div data-testid="bg-checks-page" className="pf-page-content flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--heading)" }}>
            Background Checks
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Applicant screening results &amp; history
          </p>
        </div>
        <button
          className="pf-btn pf-btn-primary flex items-center gap-2"
          data-testid="order-check-btn"
        >
          <Shield size={16} />
          Order New Check
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Pending
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--warning)" }}>
            {pending}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Clear
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--success)" }}>
            {clear}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted)" }}>
            Flagged
          </span>
          <span className="text-2xl font-bold" style={{ color: "var(--danger)" }}>
            {flagged}
          </span>
        </Card>
      </div>

      {/* Applicant Cards */}
      <div className="flex flex-col gap-4">
        {MOCK_APPLICANTS.map((applicant) => {
          const { bg } = STATUS_CONFIG[applicant.status];
          return (
            <Card key={applicant.id} className="p-4 overflow-hidden relative">
              {/* Status accent bar */}
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ background: STATUS_CONFIG[applicant.status].text }}
              />
              <div className="pl-3 flex flex-col gap-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: bg, color: STATUS_CONFIG[applicant.status].text }}
                    >
                      <User size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
                        {applicant.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>
                        {applicant.email}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={applicant.status} />
                </div>

                {/* Property info */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "var(--surface-2)", color: "var(--body)" }}
                  >
                    {applicant.property}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                  >
                    {applicant.unit}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>
                    Applied {applicant.appliedDate}
                  </span>
                </div>

                {/* Check details */}
                <div className="rounded-lg p-3" style={{ background: "var(--surface-2)" }}>
                  <CheckRow
                    icon={<CreditCard size={12} />}
                    label="Credit Score"
                    value={applicant.creditScore !== null ? String(applicant.creditScore) : "Pending"}
                    valueColor={
                      applicant.creditScore !== null
                        ? creditScoreColor(applicant.creditScore)
                        : "var(--muted)"
                    }
                  />
                  <CheckRow
                    icon={<AlertTriangle size={12} />}
                    label="Eviction History"
                    value={applicant.evictionHistory}
                    valueColor={
                      applicant.evictionHistory === "None Found"
                        ? "var(--success)"
                        : applicant.evictionHistory === "Record Found"
                        ? "var(--danger)"
                        : "var(--muted)"
                    }
                  />
                  <CheckRow
                    icon={<Shield size={12} />}
                    label="Criminal Check"
                    value={applicant.criminalCheck}
                    valueColor={
                      applicant.criminalCheck === "Clear"
                        ? "var(--success)"
                        : applicant.criminalCheck === "Flag Found"
                        ? "var(--danger)"
                        : "var(--muted)"
                    }
                  />
                  <div className="flex items-center justify-between gap-2 pt-1.5">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                      <CheckCircle2 size={12} />
                      Income Verified
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          applicant.incomeVerified === true
                            ? "var(--success)"
                            : applicant.incomeVerified === false
                            ? "var(--danger)"
                            : "var(--muted)",
                      }}
                    >
                      {applicant.incomeVerified === true
                        ? "Verified"
                        : applicant.incomeVerified === false
                        ? "Not Verified"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="pf-btn pf-btn-secondary text-xs px-3 py-1">
                    View Full Report
                  </button>
                  {applicant.status === "CLEAR" && (
                    <button className="pf-btn pf-btn-primary text-xs px-3 py-1">
                      Approve Applicant
                    </button>
                  )}
                  {applicant.status === "FLAGS" && (
                    <button
                      className="pf-btn text-xs px-3 py-1"
                      style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                    >
                      Decline Applicant
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
