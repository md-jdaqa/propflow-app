"use client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, type TabSpec } from "@/components/ui/Tabs";
import {
  RecordPaymentModal,
  useRecordPaymentModal,
} from "@/components/modals/RecordPaymentModal";
import { OverviewTab } from "./OverviewTab";
import { TransactionsTab, type TransactionsFilter } from "./TransactionsTab";
import { RulesTab } from "./RulesTab";
import { ReportsTab } from "./ReportsTab";

const VALID_TABS = ["overview", "transactions", "rules", "reports"] as const;
type FinancesTabId = (typeof VALID_TABS)[number];

interface FinancesPageProps {
  initialTab?: string;
  initialFilter?: string;
}

function normalizeTab(t?: string): FinancesTabId {
  if (t && (VALID_TABS as readonly string[]).includes(t)) {
    return t as FinancesTabId;
  }
  return "overview";
}

function normalizeFilter(f?: string): TransactionsFilter {
  switch ((f ?? "").toLowerCase()) {
    case "income":         return "income";
    case "expenses":       return "expenses";
    case "uncategorized":  return "uncategorized";
    default:               return "all";
  }
}

export function FinancesPage({ initialTab, initialFilter }: FinancesPageProps) {
  const recordModal = useRecordPaymentModal();
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  // ?tab=record opens the Record Payment modal on mount.
  useEffect(() => {
    if (!didAutoOpen && initialTab === "record") {
      recordModal.setOpen(true);
      setDidAutoOpen(true);
    }
  }, [didAutoOpen, initialTab, recordModal]);

  const filter = normalizeFilter(initialFilter);
  const defaultTab = normalizeTab(initialTab);

  const tabs: TabSpec[] = useMemo(
    () => [
      { id: "overview",     label: "Overview",     content: <OverviewTab /> },
      { id: "transactions", label: "Transactions", content: <TransactionsTab initialFilter={filter} /> },
      { id: "rules",        label: "Rules",        content: <RulesTab /> },
      { id: "reports",      label: "Reports",      content: <ReportsTab /> },
    ],
    [filter],
  );

  return (
    <div data-testid="finances-page" className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Finances</h1>
          <p className="text-sm text-muted">
            Income, expenses, rules, and Schedule E reporting.
          </p>
        </div>
        <button
          type="button"
          onClick={() => recordModal.setOpen(true)}
          data-testid="finances-record-payment"
          className="pf-btn pf-btn-primary text-sm"
        >
          Record payment
        </button>
      </header>

      <Tabs tabs={tabs} defaultTab={defaultTab} testId="finances-tabs" />

      <RecordPaymentModal
        open={recordModal.open}
        onClose={() => recordModal.setOpen(false)}
      />
    </div>
  );
}
