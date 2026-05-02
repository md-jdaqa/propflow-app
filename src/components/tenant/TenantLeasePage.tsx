"use client";
import { useState } from "react";
import { Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

const LEASE = {
  address: "406 Oak St",
  unit: "Unit 2A",
  monthlyRent: 1_900,
  start: "Nov 1, 2024",
  end: "Oct 31, 2026",
  securityDeposit: 3_800,
};

// Days until lease ends from "today" (mock: May 2, 2026)
const TODAY = new Date("2026-05-02");
const LEASE_END = new Date("2026-10-31");
const DAYS_UNTIL_END = Math.ceil(
  (LEASE_END.getTime() - TODAY.getTime()) / (1000 * 60 * 60 * 24),
);
const SHOW_RENEWAL = DAYS_UNTIL_END <= 180; // within ~6 months

export function TenantLeasePage() {
  const [dlMsg, setDlMsg] = useState("");
  const [renewStatus, setRenewStatus] = useState<"idle" | "accepted" | "declined">("idle");

  function handleDownload() {
    setDlMsg("Downloading…");
    setTimeout(() => setDlMsg(""), 2000);
  }

  return (
    <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-heading">My Lease</h1>

      {/* Lease details */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Lease Details
        </p>
        <dl className="space-y-3">
          {[
            { label: "Property", value: LEASE.address },
            { label: "Unit", value: LEASE.unit },
            { label: "Monthly Rent", value: `$${LEASE.monthlyRent.toLocaleString()}` },
            { label: "Lease Start", value: LEASE.start },
            { label: "Lease End", value: LEASE.end },
            {
              label: "Security Deposit",
              value: `$${LEASE.securityDeposit.toLocaleString()}`,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-sm font-medium text-heading text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Lease document */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Documents
        </p>
        <div
          className="flex items-center justify-between gap-3 p-3 rounded-lg border"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={20} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-heading truncate">
                Lease Agreement.pdf
              </p>
              <p className="text-xs text-muted">Signed · Nov 1, 2024</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="pf-btn pf-btn-secondary text-sm flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            <Download size={14} />
            {dlMsg || "Download"}
          </button>
        </div>
      </Card>

      {/* Renewal offer */}
      {SHOW_RENEWAL && (
        <Card>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">
                Renewal Offer
              </p>
              <p className="text-sm text-heading font-medium">
                Your lease ends in {DAYS_UNTIL_END} days
              </p>
            </div>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{
                background: "var(--warning-muted)",
                color: "var(--warning)",
              }}
            >
              Action needed
            </span>
          </div>

          <dl className="space-y-2 mb-4">
            {[
              { label: "New Monthly Rent", value: "$1,975 (+$75)" },
              { label: "New Lease Term", value: "Nov 1, 2026 – Oct 31, 2027" },
              { label: "Security Deposit", value: "No change" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-sm font-medium text-heading">{value}</dd>
              </div>
            ))}
          </dl>

          {renewStatus === "idle" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRenewStatus("accepted")}
                className="pf-btn pf-btn-primary text-sm whitespace-nowrap flex-shrink-0"
              >
                Accept Renewal
              </button>
              <button
                type="button"
                onClick={() => setRenewStatus("declined")}
                className="pf-btn pf-btn-secondary text-sm whitespace-nowrap flex-shrink-0"
              >
                Decline
              </button>
            </div>
          )}

          {renewStatus === "accepted" && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium"
              style={{ background: "var(--success-muted)", color: "var(--success)" }}
            >
              <CheckCircle size={16} />
              Renewal accepted — your landlord will be in touch.
            </div>
          )}

          {renewStatus === "declined" && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium"
              style={{ background: "var(--danger-muted)", color: "var(--danger)" }}
            >
              <XCircle size={16} />
              Renewal declined — your landlord has been notified.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
