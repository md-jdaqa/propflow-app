import { StatCard, Card } from "@/components/ui/Card";

export function RentCollectedCard() {
  return (
    <StatCard
      testId="card-rent-collected"
      label="Rent Collected (MTD)"
      value="$8,400"
      hint="of $9,200 expected"
      trend={{ dir: "up", pct: 12 }}
      accent="success"
    />
  );
}

export function OutstandingCard() {
  return (
    <StatCard
      testId="card-outstanding"
      label="Outstanding"
      value="$800"
      hint="2 tenants behind"
      accent="warning"
    />
  );
}

export function OccupancyCard() {
  return (
    <StatCard
      testId="card-occupancy"
      label="Occupancy"
      value="92%"
      hint="11 of 12 units"
      accent="primary"
    />
  );
}

export function RecentPaymentsCard() {
  const sample = [
    { who: "J. Carter",   amount: "$1,400", when: "2h ago" },
    { who: "M. Singh",    amount: "$1,800", when: "Yesterday" },
    { who: "Joseph Neff", amount: "−$420",  when: "Apr 22" },
  ];
  return (
    <Card testId="card-recent-payments" className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-heading">Recent Payments</h3>
        <a href="/finances?tab=transactions" className="text-xs text-primary">View all</a>
      </div>
      <ul className="divide-y divide-border">
        {sample.map((row) => (
          <li key={row.who + row.when} className="py-2 flex items-center justify-between text-sm">
            <span className="text-body">{row.who}</span>
            <div className="flex items-center gap-3">
              <span className="text-muted text-xs">{row.when}</span>
              <span className={row.amount.startsWith("−") ? "text-danger" : "text-success"}>{row.amount}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function UncategorizedCard() {
  return (
    <StatCard
      testId="card-uncategorized"
      label="Uncategorized"
      value={3}
      hint="Costs you tax money"
      accent="danger"
    >
      <a href="/finances?tab=transactions&filter=uncategorized" className="text-xs text-primary">
        Review now →
      </a>
    </StatCard>
  );
}

export function UpcomingCard() {
  return (
    <Card testId="card-upcoming">
      <h3 className="font-semibold text-heading mb-2 text-sm">Upcoming</h3>
      <ul className="space-y-1 text-sm">
        <li className="flex justify-between">
          <span className="text-body">Mortgage</span>
          <span className="text-muted">May 1</span>
        </li>
        <li className="flex justify-between">
          <span className="text-body">Insurance</span>
          <span className="text-muted">May 5</span>
        </li>
        <li className="flex justify-between">
          <span className="text-body">Lease renewal — Carter</span>
          <span className="text-muted">May 31</span>
        </li>
      </ul>
    </Card>
  );
}

export function TaxReadinessCard() {
  return (
    <Card testId="card-tax-readiness">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-heading text-sm">Tax Readiness</h3>
        <span className="pf-badge bg-success/10 text-success">87%</span>
      </div>
      <div className="mt-3 h-2 bg-bg rounded overflow-hidden">
        <div className="h-full bg-success" style={{ width: "87%" }} />
      </div>
      <a
        href="/api/tax-package"
        className="pf-btn pf-btn-primary mt-3 w-full text-sm"
        data-testid="tax-package-download"
      >
        Download tax package (.zip)
      </a>
    </Card>
  );
}
