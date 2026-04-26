import Link from "next/link";
import type { PropertyListItem } from "@/app/(app)/properties/page";

interface Props {
  property: PropertyListItem;
}

const TYPE_LABEL: Record<PropertyListItem["propertyType"], string> = {
  RESIDENTIAL_LTR: "Long-term",
  RESIDENTIAL_STR: "Short-term",
  COMMERCIAL: "Commercial",
  MIXED_USE: "Mixed-use",
};

const TYPE_COLOR: Record<PropertyListItem["propertyType"], string> = {
  RESIDENTIAL_LTR: "bg-primary/15 text-primary",
  RESIDENTIAL_STR: "bg-secondary/15 text-secondary",
  COMMERCIAL: "bg-warning/15 text-warning",
  MIXED_USE: "bg-success/15 text-success",
};

export function PropertyCard({ property }: Props) {
  const occupancyPct =
    property.unitsCount > 0
      ? Math.round((property.occupiedCount / property.unitsCount) * 100)
      : 0;

  return (
    <Link
      href={`/properties/${property.id}`}
      data-testid={`property-card-${property.id}`}
      className="pf-card block min-h-[7rem] hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-heading truncate">
            {property.name}
          </h3>
          <p className="text-sm text-muted truncate">
            {property.addressLine1}
            {property.addressLine2 ? `, ${property.addressLine2}` : ""}
          </p>
          <p className="text-xs text-muted">
            {property.city}, {property.state} {property.postalCode}
          </p>
          <span
            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
              TYPE_COLOR[property.propertyType]
            }`}
          >
            {TYPE_LABEL[property.propertyType]}
          </span>
        </div>

        <div
          aria-label={`Occupancy ${occupancyPct}%`}
          className="relative shrink-0 w-14 h-14 rounded-full grid place-items-center text-xs font-semibold text-heading"
          style={{
            background: `conic-gradient(var(--success) ${occupancyPct}%, var(--border) ${occupancyPct}% 100%)`,
          }}
        >
          <div className="absolute inset-1 rounded-full bg-surface grid place-items-center">
            <span>{occupancyPct}%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {property.unitsCount} {property.unitsCount === 1 ? "unit" : "units"}
        </span>
        <span>
          {property.occupiedCount}/{property.unitsCount} occupied
        </span>
      </div>
    </Link>
  );
}
