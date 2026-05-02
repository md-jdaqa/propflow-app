"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Plus, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface BudgetLine {
  id: string;
  category: string;
  budgeted: number;
  actual: number;
  property?: string;
}

interface PropertyBudget {
  property: string;
  lines: BudgetLine[];
}

const BUDGETS: PropertyBudget[] = [
  {
    property: "406 Oak St",
    lines: [
      { id: "B-01", category: "Rental Income",         budgeted: 22800, actual: 22800, property: "406 Oak St" },
      { id: "B-02", category: "Repairs & Maintenance", budgeted: 2400,  actual: 1068,  property: "406 Oak St" },
      { id: "B-03", category: "Utilities",             budgeted: 2100,  actual: 1784,  property: "406 Oak St" },
      { id: "B-04", category: "Insurance",             budgeted: 5040,  actual: 4200,  property: "406 Oak St" },
      { id: "B-05", category: "Property Tax",          budgeted: 8400,  actual: 8400,  property: "406 Oak St" },
      { id: "B-06", category: "Management Fees",       budgeted: 2280,  actual: 2280,  property: "406 Oak St" },
    ],
  },
  {
    property: "880 Airport Blvd",
    lines: [
      { id: "B-11", category: "Rental Income",         budgeted: 25200, actual: 25200, property: "880 Airport Blvd" },
      { id: "B-12", category: "Repairs & Maintenance", budgeted: 3000,  actual: 3890,  property: "880 Airport Blvd" },
      { id: "B-13", category: "Utilities",             budgeted: 1800,  actual: 1920,  property: "880 Airport Blvd" },
      { id: "B-14", category: "Insurance",             budgeted: 4800,  actual: 4800,  property: "880 Airport Blvd" },
      { id: "B-15", category: "Property Tax",          budgeted: 7200,  actual: 7200,  property: "880 Airport Blvd" },
      { id: "B-16", category: "Management Fees",       budgeted: 2520,  actual: 2520,  property: "880 Airport Blvd" },
    ],
  },
];

// Combine all lines for portfolio view
const ALL_LINES: BudgetLine[] = BUDGETS.flatMap((b) => b.lines);

function getVarianceColor(line: BudgetLine): string {
  const isIncome = line.category === "Rental Income";
  const variance = line.actual - line.budgeted;
  if (isIncome) return variance >= 0 ? "var(--success)" : "var(--danger)";
  // expenses: under budget = good
  return variance <= 0 ? "var(--success)" : "var(--danger)";
}

function getVarianceLabel(line: BudgetLine): string {
  const isIncome = line.category === "Rental Income";
  const variance = line.actual - line.budgeted;
  const sign = variance > 0 ? "+" : "";
  const pct = ((Math.abs(variance) / line.budgeted) * 100).toFixed(0);
  if (variance === 0) return "On Budget";
  if (isIncome) return variance > 0 ? `+${pct}% over` : `${pct}% short`;
  return variance > 0 ? `${sign}$${Math.abs(variance).toLocaleString()} over` : `-$${Math.abs(variance).toLocaleString()} under`;
}

export function BudgetPage() {
  const [view, setView] = useState<"PORTFOLIO" | "PROPERTY">("PORTFOLIO");
  const [selectedProperty, setSelectedProperty] = useState<string>(BUDGETS[0].property);

  const displayLines = view === "PORTFOLIO" ? ALL_LINES : BUDGETS.find(b => b.property === selectedProperty)?.lines ?? [];
  const incomeLines = displayLines.filter(l => l.category === "Rental Income");
  const expenseLines = displayLines.filter(l => l.category !== "Rental Income");

  const totalBudgetedIncome = incomeLines.reduce((s, l) => s + l.budgeted, 0);
  const totalActualIncome = incomeLines.reduce((s, l) => s + l.actual, 0);
  const totalBudgetedExpense = expenseLines.reduce((s, l) => s + l.budgeted, 0);
  const totalActualExpense = expenseLines.reduce((s, l) => s + l.actual, 0);
  const budgetedNOI = totalBudgetedIncome - totalBudgetedExpense;
  const actualNOI = totalActualIncome - totalActualExpense;
  const overBudgetLines = expenseLines.filter(l => l.actual > l.budgeted).length;

  return (
    <div data-testid="budget-page" className="space-y-5 pb-24 md:pb-6">
      <header className="flex items-start justify-between pt-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--heading)", letterSpacing: "-0.02em" }}>
            Budget Tracker
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            Budget vs. actuals per property · NOI tracking · variance alerts
          </p>
        </div>
        <button type="button" className="pf-btn pf-btn-primary text-sm flex items-center gap-1.5" data-testid="add-budget-btn">
          <Plus size={15} /> Set Budget
        </button>
      </header>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card testId="budget-income-budgeted">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Budgeted Income</p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--body)" }}>
            ${(totalBudgetedIncome / 12).toLocaleString()}<span className="text-xs font-normal">/mo</span>
          </p>
        </Card>
        <Card testId="budget-expense-actual">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Actual Expenses</p>
          <p className="text-xl font-bold mt-1" style={{ color: totalActualExpense > totalBudgetedExpense ? "var(--danger)" : "var(--body)" }}>
            ${(totalActualExpense / 12).toLocaleString()}<span className="text-xs font-normal">/mo avg</span>
          </p>
        </Card>
        <Card testId="budget-noi">
          <p className="text-xs" style={{ color: "var(--muted)" }}>NOI (YTD actual)</p>
          <p className="text-xl font-bold mt-1" style={{ color: "var(--success)" }}>
            ${actualNOI.toLocaleString()}
          </p>
        </Card>
        <Card testId="budget-overbudget">
          <p className="text-xs" style={{ color: "var(--muted)" }}>Over Budget Lines</p>
          <p className="text-xl font-bold mt-1" style={{ color: overBudgetLines > 0 ? "var(--danger)" : "var(--success)" }}>
            {overBudgetLines}
          </p>
        </Card>
      </div>

      {/* View selector */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <button
          type="button"
          onClick={() => setView("PORTFOLIO")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={view === "PORTFOLIO" ? { background: "var(--primary)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--muted)" }}
        >
          All Properties
        </button>
        <button
          type="button"
          onClick={() => setView("PROPERTY")}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
          style={view === "PROPERTY" ? { background: "var(--primary)", color: "#fff" } : { background: "var(--surface-2)", color: "var(--muted)" }}
        >
          By Property
        </button>
        {view === "PROPERTY" && (
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="pf-input text-xs py-1.5 ml-1"
          >
            {BUDGETS.map((b) => (
              <option key={b.property} value={b.property}>{b.property}</option>
            ))}
          </select>
        )}
      </div>

      {/* NOI summary banner */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(79,110,247,0.05) 100%)",
          border: "1.5px solid rgba(22,163,74,0.2)",
        }}
      >
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Budgeted NOI (YTD)</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: "var(--body)" }}>${budgetedNOI.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Actual NOI (YTD)</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: actualNOI >= budgetedNOI ? "var(--success)" : "var(--danger)" }}>
              ${actualNOI.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {actualNOI >= budgetedNOI
              ? <TrendingUp size={16} style={{ color: "var(--success)" }} />
              : <TrendingDown size={16} style={{ color: "var(--danger)" }} />
            }
            <span className="text-sm font-semibold" style={{ color: actualNOI >= budgetedNOI ? "var(--success)" : "var(--danger)" }}>
              {actualNOI >= budgetedNOI ? "+" : ""}{((actualNOI - budgetedNOI) / budgetedNOI * 100).toFixed(1)}% vs budget
            </span>
          </div>
        </div>
      </div>

      {/* Budget lines table */}
      <div className="space-y-2">
        {/* Income section */}
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted)" }}>Income</p>
        {incomeLines.map((line) => {
          const pct = Math.min((line.actual / line.budgeted) * 100, 100);
          return (
            <BudgetLineRow key={line.id} line={line} pct={pct} varianceColor={getVarianceColor(line)} label={getVarianceLabel(line)} />
          );
        })}

        {/* Expense section */}
        <p className="text-xs font-semibold uppercase tracking-wide mt-4" style={{ color: "var(--muted)" }}>Expenses</p>
        {expenseLines.map((line) => {
          const pct = Math.min((line.actual / line.budgeted) * 100, 130);
          return (
            <BudgetLineRow key={line.id} line={line} pct={pct} varianceColor={getVarianceColor(line)} label={getVarianceLabel(line)} />
          );
        })}
      </div>
    </div>
  );
}

function BudgetLineRow({ line, pct, varianceColor, label }: {
  line: BudgetLine; pct: number; varianceColor: string; label: string;
}) {
  const isOver = line.actual > line.budgeted && line.category !== "Rental Income";
  return (
    <div
      data-testid={`budget-line-${line.id}`}
      className="p-3 rounded-xl"
      style={{ background: "var(--surface-2)", border: `1px solid ${isOver ? "rgba(239,68,68,0.2)" : "var(--border)"}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--heading)" }}>{line.category}</p>
          {line.property && <p className="text-[10px]" style={{ color: "var(--muted)" }}>{line.property}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold" style={{ color: "var(--body)" }}>
            ${line.actual.toLocaleString()} <span className="text-xs font-normal" style={{ color: "var(--muted)" }}>/ ${line.budgeted.toLocaleString()}</span>
          </p>
          <p className="text-[10px] font-semibold" style={{ color: varianceColor }}>{label}</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: isOver ? "var(--danger)" : varianceColor,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: "var(--muted)" }}>0</span>
        <span className="text-[9px]" style={{ color: "var(--muted)" }}>
          {pct.toFixed(0)}% of budget
        </span>
        <span className="text-[9px]" style={{ color: "var(--muted)" }}>${line.budgeted.toLocaleString()}</span>
      </div>
    </div>
  );
}
