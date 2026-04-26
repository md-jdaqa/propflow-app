import {
  RentCollectedCard,
  OutstandingCard,
  OccupancyCard,
  RecentPaymentsCard,
  UncategorizedCard,
  UpcomingCard,
  TaxReadinessCard,
} from "@/components/dashboard/DashboardCards";

export default function DashboardPage() {
  return (
    <div data-testid="dashboard-page" className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Dashboard</h1>
          <p className="text-sm text-muted">Brooklyn portfolio · April 2026</p>
        </div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <RentCollectedCard />
        <OutstandingCard />
        <OccupancyCard />
        <UncategorizedCard />
        <RecentPaymentsCard />
        <UpcomingCard />
        <TaxReadinessCard />
      </div>
    </div>
  );
}
