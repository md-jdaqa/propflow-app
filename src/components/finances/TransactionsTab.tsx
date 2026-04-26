"use client";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { TaxBadgeChip, type TaxBadgeKind } from "./TaxBadgeChip";

export type TransactionsFilter = "all" | "income" | "expenses" | "uncategorized";

interface MockTxn {
  id: string;
  date: string;
  party: string;
  amount: number;
  badge: TaxBadgeKind;
  scheduleELine: number | null;
  category: string;
  memo: string;
}

const MOCK: MockTxn[] = [
  { id: "t1",  date: "2026-04-22", party: "J. Carter",        amount:  1400, badge: "INCOME",         scheduleELine: 3,  category: "Rent",                memo: "Apt 2 — April rent" },
  { id: "t2",  date: "2026-04-21", party: "M. Singh",         amount:  1800, badge: "INCOME",         scheduleELine: 3,  category: "Rent",                memo: "Apt 3 — April rent" },
  { id: "t3",  date: "2026-04-20", party: "Joseph Neff",      amount:  -420, badge: "DEDUCTIBLE",     scheduleELine: 11, category: "Management fees",     memo: "April mgmt — 257 Eldert" },
  { id: "t4",  date: "2026-04-18", party: "Con Edison",       amount:  -180, badge: "DEDUCTIBLE",     scheduleELine: 17, category: "Utilities",           memo: "Common area electric" },
  { id: "t5",  date: "2026-04-15", party: "NYC Dept Finance", amount:  -2100,badge: "DEDUCTIBLE",     scheduleELine: 16, category: "Property taxes",      memo: "Q2 property tax" },
  { id: "t6",  date: "2026-04-12", party: "Acme Roofing",     amount:  -3400,badge: "REVIEW",         scheduleELine: 14, category: "Repairs",             memo: "Patch + flashing" },
  { id: "t7",  date: "2026-04-10", party: "State Farm",       amount:  -310, badge: "DEDUCTIBLE",     scheduleELine: 9,  category: "Insurance",           memo: "Liability premium" },
  { id: "t8",  date: "2026-04-08", party: "Chase Mortgage",   amount:  -1820,badge: "NON_DEDUCTIBLE", scheduleELine: null, category: "Mortgage principal",memo: "Principal portion" },
  { id: "t9",  date: "2026-04-06", party: "Chase Mortgage",   amount:  -1070,badge: "DEDUCTIBLE",     scheduleELine: 12, category: "Mortgage interest",   memo: "Interest portion" },
  { id: "t10", date: "2026-04-05", party: "Zillow",           amount:    -29,badge: "DEDUCTIBLE",     scheduleELine: 5,  category: "Advertising",         memo: "Listing boost" },
  { id: "t11", date: "2026-04-03", party: "Unknown ACH",      amount:    -85,badge: "UNCATEGORIZED",  scheduleELine: null, category: "—",                memo: "Pending review" },
  { id: "t12", date: "2026-04-02", party: "L. Rivera",        amount:  1200, badge: "INCOME",         scheduleELine: 3,  category: "Rent",                memo: "Apt 1 — April rent" },
];

const FILTERS: { id: TransactionsFilter; label: string }[] = [
  { id: "all",            label: "All" },
  { id: "income",         label: "Income" },
  { id: "expenses",       label: "Expenses" },
  { id: "uncategorized",  label: "Uncategorized" },
];

const fmtAmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

interface TransactionsTabProps {
  initialFilter?: TransactionsFilter;
}

export function TransactionsTab({ initialFilter = "all" }: TransactionsTabProps) {
  const [filter, setFilter] = useState<TransactionsFilter>(initialFilter);

  const rows = useMemo(() => {
    switch (filter) {
      case "income":         return MOCK.filter((r) => r.amount > 0);
      case "expenses":       return MOCK.filter((r) => r.amount < 0);
      case "uncategorized":  return MOCK.filter((r) => r.badge === "UNCATEGORIZED");
      default:               return MOCK;
    }
  }, [filter]);

  return (
    <div data-testid="finances-transactions" className="space-y-3">
      <div
        role="tablist"
        aria-label="Filter transactions"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`txn-filter-${f.id}`}
              onClick={() => setFilter(f.id)}
              className={cn(
                "pf-btn text-sm h-10 min-h-touch px-3",
                active ? "pf-btn-primary" : "pf-btn-secondary",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        {/* mobile: stacked cards / desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-border">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Payer / Payee</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
                <th className="px-3 py-2 font-medium">Tax</th>
                <th className="px-3 py-2 font-medium">Sch. E</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Memo</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  data-testid={`txn-row-${r.id}`}
                  className="border-b border-border/60"
                >
                  <td className="px-3 py-2 text-muted whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2 text-body">{r.party}</td>
                  <td
                    className={cn(
                      "px-3 py-2 text-right whitespace-nowrap font-medium",
                      r.amount < 0 ? "text-danger" : "text-success",
                    )}
                  >
                    {fmtAmt(r.amount)}
                  </td>
                  <td className="px-3 py-2">
                    <TaxBadgeChip badge={r.badge} scheduleELine={r.scheduleELine} />
                  </td>
                  <td className="px-3 py-2 text-muted">
                    {r.scheduleELine ? `L${r.scheduleELine}` : "—"}
                  </td>
                  <td className="px-3 py-2 text-body">{r.category}</td>
                  <td className="px-3 py-2 text-muted truncate max-w-[18ch]">{r.memo}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      data-testid={`txn-categorize-${r.id}`}
                      className="pf-btn pf-btn-secondary h-9 min-h-9 px-3 text-xs"
                    >
                      Categorize
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-muted">
                    No transactions for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* mobile list */}
        <ul className="md:hidden divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.id}
              data-testid={`txn-card-${r.id}`}
              className="p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-body truncate">{r.party}</div>
                  <div className="text-xs text-muted">{r.date} · {r.category}</div>
                </div>
                <div
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap",
                    r.amount < 0 ? "text-danger" : "text-success",
                  )}
                >
                  {fmtAmt(r.amount)}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <TaxBadgeChip badge={r.badge} scheduleELine={r.scheduleELine} />
                <button
                  type="button"
                  data-testid={`txn-categorize-mobile-${r.id}`}
                  className="pf-btn pf-btn-secondary h-9 min-h-9 px-3 text-xs"
                >
                  Categorize
                </button>
              </div>
              {r.memo ? (
                <p className="text-xs text-muted truncate">{r.memo}</p>
              ) : null}
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="p-6 text-center text-muted text-sm">
              No transactions for this filter.
            </li>
          ) : null}
        </ul>
      </Card>
    </div>
  );
}
