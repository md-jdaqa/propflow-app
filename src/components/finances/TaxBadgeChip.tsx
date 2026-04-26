import { cn } from "@/lib/cn";

export type TaxBadgeKind =
  | "DEDUCTIBLE"
  | "INCOME"
  | "NON_DEDUCTIBLE"
  | "REVIEW"
  | "UNCATEGORIZED";

interface TaxBadgeChipProps {
  badge: TaxBadgeKind;
  scheduleELine?: number | null;
  className?: string;
  testId?: string;
}

const LABEL: Record<TaxBadgeKind, string> = {
  DEDUCTIBLE: "Deductible",
  INCOME: "Income",
  NON_DEDUCTIBLE: "Non-deductible",
  REVIEW: "Review",
  UNCATEGORIZED: "Uncategorized",
};

const ICON: Record<TaxBadgeKind, string> = {
  DEDUCTIBLE: "$",
  INCOME: "↑",
  NON_DEDUCTIBLE: "✕",
  REVIEW: "!",
  UNCATEGORIZED: "?",
};

const STYLE: Record<TaxBadgeKind, string> = {
  // Green
  DEDUCTIBLE: "bg-success/10 text-success border border-success/30",
  // Blue (use primary as our blue)
  INCOME: "bg-primary/10 text-primary border border-primary/30",
  // Gray
  NON_DEDUCTIBLE: "bg-muted/10 text-muted border border-muted/30",
  // Amber
  REVIEW: "bg-warning/10 text-warning border border-warning/30",
  // Red, pulsing
  UNCATEGORIZED:
    "bg-danger/10 text-danger border border-danger/40 animate-pulse",
};

export function TaxBadgeChip({
  badge,
  scheduleELine,
  className,
  testId,
}: TaxBadgeChipProps) {
  const title =
    badge === "DEDUCTIBLE" && scheduleELine
      ? `Sch. E Line ${scheduleELine}`
      : badge === "INCOME"
      ? "Taxable income"
      : badge === "NON_DEDUCTIBLE"
      ? "Not deductible"
      : badge === "REVIEW"
      ? "Review with CPA"
      : "Uncategorized — costs you tax money";

  return (
    <span
      data-testid={testId ?? `tax-badge-${badge.toLowerCase()}`}
      data-badge={badge}
      title={title}
      className={cn("pf-badge", STYLE[badge], className)}
    >
      <span aria-hidden="true">{ICON[badge]}</span>
      <span>{LABEL[badge]}</span>
      {scheduleELine && badge === "DEDUCTIBLE" ? (
        <span className="opacity-70">L{scheduleELine}</span>
      ) : null}
    </span>
  );
}
