"use client";
import Link from "next/link";
import type { PropertyListItem } from "@/app/(app)/properties/page";
import { Building2, DoorOpen, ChevronRight } from "lucide-react";

interface Props {
  property: PropertyListItem;
  index?: number;
}

const TYPE_LABEL: Record<PropertyListItem["propertyType"], string> = {
  RESIDENTIAL_LTR: "Long-term",
  RESIDENTIAL_STR: "Short-term",
  COMMERCIAL: "Commercial",
  MIXED_USE: "Mixed-use",
};

const TYPE_STYLES: Record<PropertyListItem["propertyType"], { bg: string; color: string }> = {
  RESIDENTIAL_LTR: { bg: "var(--primary-muted)",  color: "var(--primary)"   },
  RESIDENTIAL_STR: { bg: "rgba(14,165,160,0.12)", color: "var(--secondary)" },
  COMMERCIAL:      { bg: "var(--warning-muted)",  color: "var(--warning)"   },
  MIXED_USE:       { bg: "var(--success-muted)",  color: "var(--success)"   },
};

export function PropertyCard({ property, index = 0 }: Props) {
  const occupancyPct =
    property.unitsCount > 0
      ? Math.round((property.occupiedCount / property.unitsCount) * 100)
      : 0;

  const { bg, color } = TYPE_STYLES[property.propertyType];

  // SVG ring params
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (occupancyPct / 100) * circ;

  return (
    <Link
      href={`/properties/${property.id}`}
      data-testid={`property-card-${property.id}`}
      className="pf-card pf-card-interactive block pf-animate-card-in group relative overflow-hidden"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Top accent gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color} 0%, transparent 80%)` }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md mb-2"
            style={{ background: bg, color }}
          >
            <Building2 size={10} strokeWidth={2.5} />
            {TYPE_LABEL[property.propertyType]}
          </span>

          <h3
            className="text-base font-semibold truncate flex items-center gap-1 group-hover:text-[var(--primary)] transition-colors"
            style={{ color: "var(--heading)" }}
          >
            {property.name}
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5"
              style={{ color: "var(--primary)", flexShrink: 0 }}
            />
          </h3>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
            {property.addressLine1}
            {property.addressLine2 ? `, ${property.addressLine2}` : ""}
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {property.city}, {property.state} {property.postalCode}
          </p>
        </div>

        {/* SVG Occupancy ring */}
        <div className="flex-shrink-0 flex flex-col items-center gap-0.5">
          <svg width="56" height="56" viewBox="0 0 56 56" className="rotate-[-90deg]">
            {/* Track */}
            <circle
              cx="28" cy="28" r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth="4"
            />
            {/* Progress */}
            <circle
              cx="28" cy="28" r={r}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          {/* Label overlaid */}
          <div
            className="absolute text-xs font-bold"
            style={{
              color,
              marginTop: "-40px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
          <span
            className="text-xs font-bold -mt-10"
            style={{ color }}
          >
            {occupancyPct}%
          </span>
          <span className="text-[10px]" style={{ color: "var(--muted)" }}>occ.</span>
        </div>
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
          <DoorOpen size={12} />
          {property.unitsCount} {property.unitsCount === 1 ? "unit" : "units"}
        </div>
        <div className="text-xs font-medium" style={{ color: "var(--body)" }}>
          {property.occupiedCount}/{property.unitsCount} occupied
        </div>
      </div>
    </Link>
  );
}
