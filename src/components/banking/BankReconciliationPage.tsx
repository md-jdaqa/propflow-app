"use client";
import { useState } from "react";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle, Plus, Download, Upload, Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

type MatchStatus = "MATCHED" | "UNMATCHED" | "PENDING";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number; // negative = debit
  bankBalance?: number;
  matchedTo?: string;
  status: MatchStatus;
}

interface GLEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  account: string;
  property?: string;
  matchedTo?: string;
}

const BANK_TXN: BankTransaction[] = [
  { id: "BK-001", date: "2026-05-01", description: "ZELLE PAYMENT - CARLOS RIVERA", amount: 1900, status: "MATCHED", matchedTo: "GL-001" },
  { id: "BK-002", date: "2026-05-01", description: "ZELLE PAYMENT - SARAH CHEN", amount: 2100, status: "MATCHED", matchedTo: "GL-002" },
  { id: "BK-003", date: "2026-04-30", description: "ACH DEBIT - NATIONAL GRID", amount: -178.40, status: "MATCHED", matchedTo: "GL-005" },
  { id: "BK-004", date: "2026-04-29", description: "CHECK #1042 - MARCUS PLUMBING", amount: -890, status: "PENDING", matchedTo: undefined },
  { id: "BK-005", date: "2026-04-28", description: "INCOMING WIRE - UNKNOWN SENDER", amount: 500, status: "UNMATCHED", matchedTo: undefined },
  { id: "BK-006", date: "2026-04-27", description: "ZELLE PAYMENT - ROBERT DAVIS", amount: 1750, status: "MATCHED", matchedTo: "GL-003" },
];

const GL_ENTRIES: GLEntry[] = [
  { id: "GL-001", date: "2026-05-01", description: "May rent — 406 Oak St 2A", amount: 1900, account: "Rental Income", property: "406 Oak St", matchedTo: "BK-001" },
  { id: "GL-002", date: "2026-05-01", description: "May rent — 880 Airport Blvd 1B", amount: 2100, account: "Rental Income", property: "880 Airport Blvd", matchedTo: "BK-002" },
  { id: "GL-003", date: "2026-04-27", description: "April rent — 33 Orchard Plaza 1A", amount: 1750, account: "Rental Income", property: "33 Orchard Plaza", matchedTo: "BK-006" },
  { id: "GL-004", date: "2026-04-29", description: "Marcus lock replacement — 33 Orchard", amount: -890, account: "Repairs & Maintenance", property: "33 Orchard Plaza", matchedTo: undefined },
  { id: "GL-005", date: "2026-04-30", description: "National Grid — 406 Oak St", amount: -178.40, account: "Utilities", property: "406 Oak St", matchedTo: "BK-003" },
];

const STATUS_CFG: Record<MatchStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  MATCHED:   { label: "Matched",   color: "var(--success)", bg: "rgba(22,163,74,0.1)",  icon: CheckCircle2 },
  PENDING:   { label: "Pending",   color: "#ca8a04",        bg: "rgba(234,179,8,0.1)", icon: AlertCircle },
  UNMATCHED: { label: "Unmatched", color: "var(--danger)",  bg: "rgba(239,68,68,0.1)", icon: XCircle },
};

export function BankReconciliationPage() {
  const [activeView, setActiveView] = useState<"BANK" | "GL" | "SPLIT">("SPLIT");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedGL, setSelectedGL] = useState<string | null>(null);

  const matched = BANK_TXN.filter((t) => t.status === "MATCHED").length;
  const unmatched = BANK_TXN.filter((t) => t.status === "UNMATCHED").length;
  const pending = BANK_TXN.filter((t) => t.status === "PENDING").length;
  const bankTotal = BANK_TXN.reduce((s, t) => s + t.amount, 0);
  const glTotal = GL_ENTRIES.reduce((s, e) => s + e.amount, 0);
  const difference = bankTotal - glTotal;

  return (
    <div data-testid="bank-rec-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Bank Reconciliation
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Match bank transactions to your general ledger · resolve discrepancies
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="pf-btn pf-btn-secondary text-sm flex items-center gap-1.5">
            <Upload size={14} /> Import
          </button>
          <button type="button" className="pf-btn pf-btn-primary text-sm flex items-center gap-1.5" data-testid="connect-bank-btn">
            <Link2 size={14} /> Connect Bank
          </button>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card testId="rec-stat-matched">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Matched</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--success)" }}>{matched}</p>
        </Card>
        <Card testId="rec-stat-unmatched">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Unmatched</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "var(--danger)" }}>{unmatched}</p>
        </Card>
        <Card testId="rec-stat-pending">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Pending</p>
          <p className="text-2xl font-bold mt-1" style={{ color: "#ca8a04" }}>{pending}</p>
        </Card>
        <Card testId="rec-stat-diff">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Difference</p>
          <p className="text-2xl font-bold mt-1" style={{ color: difference === 0 ? "var(--success)" : "var(--danger)" }}>
            {difference === 0 ? "✓ $0" : `$${Math.abs(difference).toFixed(2)}`}
          </p>
        </Card>
      </div>

      {/* Totals row */}
      <div
        className="rounded-2xl p-4 flex flex-wrap gap-6"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Bank Statement Total</p>
          <p className="text-lg font-bold" style={{ color: "var(--body)" }}>${bankTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "var(--muted)" }}>GL Total</p>
          <p className="text-lg font-bold" style={{ color: "var(--body)" }}>${glTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        {difference !== 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={14} style={{ color: "var(--danger)" }} />
            <p className="text-sm font-semibold" style={{ color: "var(--danger)" }}>
              ${Math.abs(difference).toFixed(2)} unreconciled
            </p>
          </div>
        )}
        <div className="ml-auto">
          <button type="button" className="pf-btn pf-btn-secondary text-xs flex items-center gap-1.5">
            <Download size={11} /> Export Rec Report
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1.5">
        {(["SPLIT", "BANK", "GL"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActiveView(v)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
            style={activeView === v ? { background: "var(--primary)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--muted)" }}
          >
            {v === "SPLIT" ? "Side by Side" : v === "BANK" ? "Bank Transactions" : "GL Entries"}
          </button>
        ))}
      </div>

      {/* Side by side or single view */}
      <div className={`${activeView === "SPLIT" ? "grid md:grid-cols-2 gap-4" : ""}`}>
        {/* Bank transactions */}
        {(activeView === "SPLIT" || activeView === "BANK") && (
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>Bank Transactions</p>
            {BANK_TXN.map((txn) => {
              const cfg = STATUS_CFG[txn.status];
              const Icon = cfg.icon;
              const isSelected = selectedBank === txn.id;
              return (
                <div
                  key={txn.id}
                  data-testid={`bank-txn-${txn.id}`}
                  onClick={() => setSelectedBank(isSelected ? null : txn.id)}
                  className="p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isSelected ? "rgba(79,110,247,0.08)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "rgba(79,110,247,0.4)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--heading)" }}>{txn.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{txn.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: txn.amount > 0 ? "var(--success)" : "var(--danger)" }}>
                        {txn.amount > 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <Icon size={10} style={{ color: cfg.color }} />
                        <span className="text-[9px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  {txn.status === "UNMATCHED" && (
                    <button type="button" className="mt-2 text-xs px-2 py-1 rounded-lg w-full" style={{ background: "rgba(79,110,247,0.1)", color: "var(--primary)" }}>
                      + Match to GL Entry
                    </button>
                  )}
                  {txn.status === "PENDING" && (
                    <div className="flex gap-2 mt-2">
                      <button type="button" className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}>Mark as Reconciled</button>
                      <button type="button" className="text-xs px-2 py-1 rounded-lg flex-1" style={{ background: "rgba(79,110,247,0.1)", color: "var(--primary)" }}>Create GL Entry</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* GL entries */}
        {(activeView === "SPLIT" || activeView === "GL") && (
          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: "var(--heading)" }}>General Ledger</p>
            {GL_ENTRIES.map((entry) => {
              const isSelected = selectedGL === entry.id;
              return (
                <div
                  key={entry.id}
                  data-testid={`gl-entry-${entry.id}`}
                  onClick={() => setSelectedGL(isSelected ? null : entry.id)}
                  className="p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: isSelected ? "rgba(79,110,247,0.08)" : "var(--surface-2)",
                    border: `1px solid ${isSelected ? "rgba(79,110,247,0.4)" : "var(--border)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--heading)" }}>{entry.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                        {entry.account}{entry.property ? ` · ${entry.property}` : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: entry.amount > 0 ? "var(--success)" : "var(--danger)" }}>
                        {entry.amount > 0 ? "+" : ""}${Math.abs(entry.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>{entry.date}</p>
                    </div>
                  </div>
                  {!entry.matchedTo && (
                    <button type="button" className="mt-2 text-xs px-2 py-1 rounded-lg w-full" style={{ background: "rgba(79,110,247,0.1)", color: "var(--primary)" }}>
                      + Match to Bank Transaction
                    </button>
                  )}
                  {entry.matchedTo && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <CheckCircle2 size={10} style={{ color: "var(--success)" }} />
                      <span className="text-[10px]" style={{ color: "var(--success)" }}>Matched to {entry.matchedTo}</span>
                    </div>
                  )}
                </div>
              );
            })}
            <button type="button" className="pf-btn pf-btn-secondary text-xs w-full flex items-center gap-1.5 justify-center">
              <Plus size={12} /> Add GL Entry Manually
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
