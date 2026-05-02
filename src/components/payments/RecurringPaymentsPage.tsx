"use client";
import { useState } from "react";
import { Plus, CreditCard, Calendar, CheckCircle2, AlertTriangle, Clock, Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";

type PaymentFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUALLY";
type PaymentStatus = "ACTIVE" | "PAUSED" | "OVERDUE" | "UPCOMING";
type PaymentType = "RENT" | "UTILITY" | "INSURANCE" | "MORTGAGE" | "HOA" | "OTHER";

interface RecurringPayment {
  id: string;
  name: string;
  type: PaymentType;
  amount: number;
  frequency: PaymentFrequency;
  nextDue: string;
  lastPaid?: string;
  status: PaymentStatus;
  property?: string;
  tenant?: string;
  method: string;
  autoCharge: boolean;
}

const PAYMENTS: RecurringPayment[] = [
  {
    id: "RP-001", name: "406 Oak St — Unit 2A Rent", type: "RENT",
    amount: 1900, frequency: "MONTHLY", nextDue: "2026-06-01", lastPaid: "2026-05-01",
    status: "ACTIVE", property: "406 Oak St", tenant: "Carlos Rivera",
    method: "ACH / Zelle", autoCharge: false,
  },
  {
    id: "RP-002", name: "880 Airport Blvd — Unit 1B Rent", type: "RENT",
    amount: 2100, frequency: "MONTHLY", nextDue: "2026-06-01", lastPaid: "2026-05-01",
    status: "ACTIVE", property: "880 Airport Blvd", tenant: "Sarah Chen",
    method: "ACH Auto-pay", autoCharge: true,
  },
  {
    id: "RP-003", name: "National Grid — 406 Oak St", type: "UTILITY",
    amount: 178.40, frequency: "MONTHLY", nextDue: "2026-05-15", lastPaid: "2026-04-15",
    status: "UPCOMING", property: "406 Oak St",
    method: "Bank Draft", autoCharge: true,
  },
  {
    id: "RP-004", name: "Property Insurance — All Properties", type: "INSURANCE",
    amount: 420, frequency: "MONTHLY", nextDue: "2026-05-05", lastPaid: "2026-04-05",
    status: "OVERDUE", method: "Check", autoCharge: false,
  },
  {
    id: "RP-005", name: "33 Orchard Plaza — HOA Fee", type: "HOA",
    amount: 285, frequency: "MONTHLY", nextDue: "2026-05-20", lastPaid: "2026-04-20",
    status: "ACTIVE", property: "33 Orchard Plaza",
    method: "ACH Auto-pay", autoCharge: true,
  },
  {
    id: "RP-006", name: "33 Orchard Plaza — Unit 1A Rent", type: "RENT",
    amount: 1600, frequency: "MONTHLY", nextDue: "2026-05-08", lastPaid: "2026-04-08",
    status: "PAUSED", property: "33 Orchard Plaza", tenant: "Jake Tenant",
    method: "ACH / Zelle", autoCharge: false,
  },
];

const TYPE_CFG: Record<PaymentType, { color: string; bg: string }> = {
  RENT:     { color: "var(--primary)", bg: "rgba(79,110,247,0.1)" },
  UTILITY:  { color: "#ca8a04",        bg: "rgba(234,179,8,0.1)" },
  INSURANCE:{ color: "var(--success)", bg: "rgba(22,163,74,0.1)" },
  MORTGAGE: { color: "var(--danger)",  bg: "rgba(239,68,68,0.1)" },
  HOA:      { color: "#8b5cf6",        bg: "rgba(139,92,246,0.1)" },
  OTHER:    { color: "var(--muted)",   bg: "var(--surface-2)" },
};

const STATUS_CFG: Record<PaymentStatus, { label: string; color: string; icon: typeof Clock }> = {
  ACTIVE:   { label: "Active",   color: "var(--success)", icon: CheckCircle2 },
  PAUSED:   { label: "Paused",   color: "var(--muted)",   icon: Pause },
  OVERDUE:  { label: "Overdue",  color: "var(--danger)",  icon: AlertTriangle },
  UPCOMING: { label: "Upcoming", color: "var(--primary)", icon: Clock },
};

export function RecurringPaymentsPage() {
  const [payments, setPayments] = useState(PAYMENTS);
  const [filterType, setFilterType] = useState<PaymentType | "ALL">("ALL");

  function togglePause(id: string) {
    setPayments((prev) => prev.map((p) =>
      p.id === id ? { ...p, status: p.status === "PAUSED" ? "ACTIVE" : "PAUSED" } : p
    ));
  }

  const filtered = filterType === "ALL" ? payments : payments.filter((p) => p.type === filterType);
  const totalMonthly = payments.filter(p => p.frequency === "MONTHLY" && p.status !== "PAUSED").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter(p => p.status === "OVERDUE").length;
  const autoPayCount = payments.filter(p => p.autoCharge && p.status === "ACTIVE").length;

  return (
    <div data-testid="recurring-payments-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Recurring Payments
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Rent collection · utilities · insurance · auto-pay schedules
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm flex items-center gap-1.5" data-testid="add-recurring-btn">
          <Plus size={15} /> Add Schedule
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card testId="rec-stat-monthly">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Monthly Total</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--body)" }}>
            ${totalMonthly.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </p>
        </Card>
        <Card testId="rec-stat-overdue">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Overdue</p>
          <p className="text-2xl font-bold mt-1" style={{ color: overdue > 0 ? "var(--danger)" : "var(--success)" }}>
            {overdue}
          </p>
        </Card>
        <Card testId="rec-stat-autopay">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Auto-Pay On</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--success)" }}>{autoPayCount}</p>
        </Card>
      </div>

      {/* Upcoming alert */}
      {overdue > 0 && (
        <div
          className="rounded-2xl p-3 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            <span className="font-semibold">{overdue} overdue payment{overdue > 1 ? "s" : ""}</span> — action required before next billing cycle
          </p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["ALL", "RENT", "UTILITY", "INSURANCE", "HOA", "MORTGAGE"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterType(f as PaymentType | "ALL")}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={filterType === f ? { background: "var(--primary)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--muted)" }}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Payment list */}
      <div className="space-y-2">
        {filtered.map((pmt) => {
          const typeCfg = TYPE_CFG[pmt.type];
          const statusCfg = STATUS_CFG[pmt.status];
          const StatusIcon = statusCfg.icon;
          const isPaused = pmt.status === "PAUSED";
          return (
            <Card key={pmt.id} testId={`payment-row-${pmt.id}`}>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: typeCfg.bg }}
                >
                  <CreditCard size={15} style={{ color: typeCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: isPaused ? "var(--muted)" : "var(--heading)" }}>
                        {pmt.name}
                      </p>
                      {pmt.tenant && (
                        <p className="text-xs" style={{ color: "var(--muted)" }}>Tenant: {pmt.tenant}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold" style={{ color: isPaused ? "var(--muted)" : "var(--body)" }}>
                        ${pmt.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--muted)" }}>{pmt.frequency.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <div className="flex items-center gap-1" style={{ color: statusCfg.color }}>
                      <StatusIcon size={10} />
                      <span className="font-semibold text-[10px]">{statusCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      <span>Next: {pmt.nextDue}</span>
                    </div>
                    {pmt.autoCharge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}>
                        Auto-pay
                      </span>
                    )}
                    <span>{pmt.method}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                {pmt.status === "OVERDUE" && (
                  <button type="button" className="pf-btn pf-btn-primary text-xs flex-1">Record Payment</button>
                )}
                <button
                  type="button"
                  onClick={() => togglePause(pmt.id)}
                  className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5"
                >
                  {isPaused ? <><Play size={11} /> Resume</> : <><Pause size={11} /> Pause</>}
                </button>
                <button type="button" className="pf-btn pf-btn-secondary text-xs">Edit</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
