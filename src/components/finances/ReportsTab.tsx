"use client";
import { Card } from "@/components/ui/Card";

interface ReportSpec {
  id: string;
  title: string;
  blurb: string;
}

const REPORTS: ReportSpec[] = [
  {
    id: "schedule-e",
    title: "Schedule E Report",
    blurb: "Per-property income & expenses mapped to IRS Schedule E lines 3–19.",
  },
  {
    id: "pnl",
    title: "Profit & Loss",
    blurb: "Cash-basis P&L by month, with category subtotals and net cash flow.",
  },
  {
    id: "rent-roll",
    title: "Rent Roll",
    blurb: "Tenant, unit, monthly rent, balance owed, and lease end date.",
  },
  {
    id: "1099-nec",
    title: "1099-NEC",
    blurb: "Contractors paid $600+ in calendar year. Generates filing-ready summaries.",
  },
];

export function ReportsTab() {
  return (
    <div data-testid="finances-reports" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {REPORTS.map((r) => (
        <Card key={r.id} testId={`report-card-${r.id}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-semibold text-heading">{r.title}</h3>
          </div>
          <p className="text-sm text-muted mb-4">{r.blurb}</p>
          <button
            type="button"
            data-testid={`report-generate-${r.id}`}
            onClick={() => {
              // eslint-disable-next-line no-console
              console.log(`[reports] generate ${r.id}`);
            }}
            className="pf-btn pf-btn-primary text-sm"
          >
            Generate
          </button>
        </Card>
      ))}
    </div>
  );
}
