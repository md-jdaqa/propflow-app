"use client";
import { useState } from "react";
import { CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

const HISTORY = [
  { month: "May 2026",   date: "May 1, 2026",   amount: 1_900 },
  { month: "Apr 2026",   date: "Apr 1, 2026",   amount: 1_900 },
  { month: "Mar 2026",   date: "Mar 1, 2026",   amount: 1_900 },
  { month: "Feb 2026",   date: "Feb 1, 2026",   amount: 1_900 },
  { month: "Jan 2026",   date: "Jan 1, 2026",   amount: 1_900 },
  { month: "Dec 2025",   date: "Dec 1, 2025",   amount: 1_900 },
];

export function TenantPaymentsPage() {
  const [autoPay, setAutoPay] = useState(false);
  const [payMsg, setPayMsg] = useState("");

  function handlePayNow() {
    setPayMsg("Payment portal coming soon");
    setTimeout(() => setPayMsg(""), 2000);
  }

  return (
    <div className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-heading">Payments</h1>

      {/* Balance card */}
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">
              Next Payment Due
            </p>
            <p className="text-3xl font-bold text-heading">$1,900</p>
            <p className="text-sm text-muted mt-0.5">Due June 1, 2026</p>
          </div>
          <button
            type="button"
            onClick={handlePayNow}
            className="pf-btn pf-btn-primary text-sm mt-1 whitespace-nowrap flex-shrink-0"
          >
            {payMsg || "Pay Now"}
          </button>
        </div>
        {payMsg && (
          <p className="mt-3 text-xs text-muted">{payMsg}</p>
        )}
      </Card>

      {/* Auto-pay toggle */}
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-heading">Auto-Pay</p>
            <p className="text-xs text-muted mt-0.5">
              {autoPay
                ? "Auto-pay enabled — rent is paid automatically on the 1st."
                : "Enable to automatically pay rent each month."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoPay((p) => !p)}
            className="flex-shrink-0 transition-colors"
            aria-label="Toggle auto-pay"
            style={{ color: autoPay ? "var(--success)" : "var(--muted)" }}
          >
            {autoPay ? (
              <ToggleRight size={36} strokeWidth={1.5} />
            ) : (
              <ToggleLeft size={36} strokeWidth={1.5} />
            )}
          </button>
        </div>
        {autoPay && (
          <div
            className="mt-3 flex items-center gap-2 text-xs font-medium p-2 rounded-lg"
            style={{ background: "var(--success-muted)", color: "var(--success)" }}
          >
            <CheckCircle size={14} />
            Auto-pay enabled
          </div>
        )}
      </Card>

      {/* Payment history */}
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">
          Payment History
        </p>
        <div className="space-y-0">
          {HISTORY.map((row, i) => (
            <div
              key={row.month}
              className="flex items-center justify-between gap-3 py-3"
              style={{
                borderTop: i > 0 ? "1px solid var(--border)" : undefined,
              }}
            >
              <div>
                <p className="text-sm font-medium text-heading">{row.month}</p>
                <p className="text-xs text-muted">{row.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-heading">
                  ${row.amount.toLocaleString()}
                </span>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: "var(--success-muted)",
                    color: "var(--success)",
                  }}
                >
                  <CheckCircle size={11} />
                  Paid
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
