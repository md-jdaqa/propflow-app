import { FinancesPage } from "@/components/finances/FinancesPage";

interface FinancesRouteProps {
  searchParams?: { tab?: string; filter?: string };
}

export default function FinancesRoute({ searchParams }: FinancesRouteProps) {
  const tab = searchParams?.tab ?? "overview";
  const filter = searchParams?.filter;
  return <FinancesPage initialTab={tab} initialFilter={filter} />;
}
