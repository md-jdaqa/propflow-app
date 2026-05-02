import { StatCard, Card } from "@/components/ui/Card";
import {
  DollarSign,
  AlertCircle,
  Home,
  AlertTriangle,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export function RentCollectedCard() {
  return (
    <StatCard
      testId="card-rent-collected"
      label="Rent Collected (MTD)"
      value="$8,400"
      hint="of $9,200 expected"
      trend={{ dir: "up", pct: 12 }}
      accent="success"
      icon={<DollarSign size={15} />}
      animationDelay={0}
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
      icon={<AlertCircle size={15} />}
      animationDelay={50}
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
      icon={<Home size={15} />}
      animationDelay={100}
    />
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
      icon={<AlertTriangle size={15} />}
      animationDelay={150}
    >
      <a
        href="/finances?tab=transactions&filter=uncategorized"
        className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
        style={{ color: "var(--primary)" }}
      >
        Review now
        <ArrowRight size={11} />
      </a>
    </StatCard>
  );
}

export function RecentPaymentsCard() {
  const sample = [
    { who: "J. Carter",   amount: "$1,400", when: "2h ago",   positive: true },
    { who: "M. Singh",    amount: "$1,800", when: "Yesterday", positive: true },
    { who: "Joseph Neff", amount: "−$420",  when: "Apr 22",   positive: false },
  ];
  return (
    <Card testId="card-recent-payments" className="md:col-span-2 pf-animate-fade-up pf-stagger-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
            Recent Payments
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            Last 7 days
          </p>
        </div>
        <a
          href="/finances?tab=transactions"
          className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
          style={{ color: "var(--primary)" }}
        >
          View all
          <ArrowRight size={11} />
        </a>
      </div>
      <ul className="space-y-1">
        {sample.map((row) => (
          <li
            key={row.who + row.when}
            className="flex items-center justify-between text-sm py-2.5 px-3 rounded-xl transition-colors hover:bg-[var(--surface-2)]"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{
                  background: row.positive ? "var(--success)" : "var(--danger)",
                  opacity: 0.85,
                }}
              >
                {row.who.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div className="font-medium text-sm" style={{ color: "var(--body)" }}>
                  {row.who}
                </div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>
                  {row.when}
                </div>
              </div>
            </div>
            <span
              className="font-semibold text-sm"
              style={{ color: row.positive ? "var(--success)" : "var(--danger)" }}
            >
              {row.amount}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function UpcomingCard() {
  const items = [
    { label: "Mortgage",              date: "May 1",  type: "expense" },
    { label: "Insurance",             date: "May 5",  type: "expense" },
    { label: "Lease renewal — Carter", date: "May 31", type: "reminder" },
  ];
  return (
    <Card testId="card-upcoming" className="pf-animate-fade-up pf-stagger-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 pf-icon-secondary">
          <Calendar size={15} />
        </div>
        <h3 className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
          Upcoming
        </h3>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--body)" }}>{item.label}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                color: item.type === "expense" ? "var(--warning)" : "var(--primary)",
                background: item.type === "expense" ? "var(--warning-muted)" : "var(--primary-muted)",
              }}
            >
              {item.date}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function TaxReadinessCard() {
  const pct = 87;
  return (
    <Card testId="card-tax-readiness" className="pf-animate-fade-up pf-stagger-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 pf-icon-success">
            <FileText size={15} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: "var(--heading)" }}>
            Tax Readiness
          </h3>
        </div>
        <span
          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--success-muted)", color: "var(--success)" }}
        >
          <CheckCircle2 size={11} />
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-3"
        style={{ background: "var(--surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--success) 0%, color-mix(in srgb, var(--success) 60%, var(--secondary)) 100%)",
          }}
        />
      </div>

      <a
        href="/api/tax-package"
        className="pf-btn pf-btn-primary w-full text-sm"
        data-testid="tax-package-download"
        style={{ justifyContent: "center" }}
      >
        Download tax package (.zip)
      </a>
    </Card>
  );
}
