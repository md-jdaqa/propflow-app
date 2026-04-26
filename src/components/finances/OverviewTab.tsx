import { Card, StatCard } from "@/components/ui/Card";

interface ScheduleEBreakdownRow {
  line: number;
  label: string;
  amount: number;
}

const BREAKDOWN: ScheduleEBreakdownRow[] = [
  { line: 5, label: "Advertising", amount: 240 },
  { line: 9, label: "Insurance", amount: 1240 },
  { line: 11, label: "Management fees", amount: 1680 },
  { line: 12, label: "Mortgage interest", amount: 4280 },
  { line: 14, label: "Repairs & maintenance", amount: 950 },
  { line: 16, label: "Property taxes", amount: 2100 },
  { line: 17, label: "Utilities", amount: 410 },
  { line: 19, label: "Other (HOA, pest, snow)", amount: 320 },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function OverviewTab() {
  const incomeMTD = 8400;
  const incomeYTD = 33600;
  const expensesMTD = 2480;
  const expensesYTD = 11220;
  const netMTD = incomeMTD - expensesMTD;
  const netYTD = incomeYTD - expensesYTD;

  const max = Math.max(...BREAKDOWN.map((r) => r.amount), 1);

  return (
    <div data-testid="finances-overview" className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          testId="overview-income-mtd"
          label="Income (MTD)"
          value={fmt(incomeMTD)}
          hint={`YTD ${fmt(incomeYTD)}`}
          accent="success"
          trend={{ dir: "up", pct: 12 }}
        />
        <StatCard
          testId="overview-expenses-mtd"
          label="Expenses (MTD)"
          value={fmt(expensesMTD)}
          hint={`YTD ${fmt(expensesYTD)}`}
          accent="danger"
          trend={{ dir: "down", pct: 4 }}
        />
        <StatCard
          testId="overview-net-mtd"
          label="Net cash flow (MTD)"
          value={fmt(netMTD)}
          hint={`YTD ${fmt(netYTD)}`}
          accent="primary"
        />
        <StatCard
          testId="overview-net-ytd"
          label="Net cash flow (YTD)"
          value={fmt(netYTD)}
          hint="Calendar year-to-date"
          accent="secondary"
        />
      </div>

      <Card testId="overview-breakdown">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-heading">
            Expense breakdown by Schedule E line
          </h3>
          <span className="text-xs text-muted">YTD</span>
        </div>
        <ul className="space-y-3">
          {BREAKDOWN.map((row) => {
            const pct = Math.round((row.amount / max) * 100);
            return (
              <li
                key={row.line}
                data-testid={`overview-breakdown-line-${row.line}`}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-body">
                    <span className="text-muted mr-2">L{row.line}</span>
                    {row.label}
                  </span>
                  <span className="text-body font-medium">{fmt(row.amount)}</span>
                </div>
                <div className="h-2 bg-bg rounded overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${pct}%` }}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
